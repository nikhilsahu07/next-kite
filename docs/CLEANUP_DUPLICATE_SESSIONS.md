# Cleanup Duplicate Sessions

## Problem
If you have duplicate sessions in your `kite-sessions` table (multiple rows with the same `accountId` but different `sessionId` or `requestToken`), you need to clean them up.

## Why This Happened
- **Old Bug #1**: The previous code used `crypto.randomUUID()` to generate a new `sessionId` each time, which created duplicate entries
- **Old Bug #2**: DynamoDB error when trying to update the primary key field (`sessionId`) in the updates object
- **Fixed**: 
  - Now uses consistent `sessionId` format: `sess_${accountId}`
  - Properly separates key from updates (DynamoDB constraint)
  - Uses UPDATE first, falls back to CREATE if session doesn't exist

## How to Clean Up

### Option 1: Manual Cleanup via Database
1. Go to your backend database (DynamoDB/MongoDB/etc.)
2. Navigate to the `kite-sessions` table
3. For each `accountId`, keep only the LATEST session (highest `updatedAt` or `createdAt`)
4. Delete all other sessions for that `accountId`

### Option 2: Keep Sessions with Consistent IDs
Since the fix now uses `sess_${accountId}` format, you can:
1. Delete all sessions where `sessionId` does NOT match pattern `sess_${accountId}`
2. The new sessions created after the fix will automatically have the correct format

### Option 3: Clean Start (Recommended)
1. Delete ALL rows from `kite-sessions` table
2. Go to Kite Accounts page
3. Click "Get Access Token" for each account
4. New sessions will be created with the correct `sessionId` format

## Example Cleanup Query (DynamoDB)

If you're using DynamoDB and want to keep only the latest session per account:

```javascript
// Pseudo-code - adapt to your database
const accounts = await getAllFromTable('kite-accounts');

for (const account of accounts) {
  // Delete all old sessions for this account
  const oldSessions = await queryTable('kite-sessions', {
    accountId: account.accountId
  });
  
  for (const session of oldSessions) {
    // Delete sessions that don't match new format
    if (session.sessionId !== `sess_${account.accountId}`) {
      await deleteItem('kite-sessions', { sessionId: session.sessionId });
    }
  }
}
```

## Verification

After cleanup, verify:
1. Each account should have at most ONE entry in `kite-sessions`
2. The `sessionId` should match pattern: `sess_${accountId}`
3. The session should be referenced in the `kite-accounts` table under `account.session`

## DynamoDB Constraint Explained

**Error**: "Cannot update attribute sessionId. This attribute is part of the key"

In DynamoDB:
- The primary key (`sessionId`) cannot be updated
- When using PUT, you must specify the key separately in the `key` parameter
- The `updates` object must NOT include the primary key field

**Wrong** ❌:
```javascript
await axios.put('/crud', {
  key: { sessionId: 'sess_123' },
  updates: {
    sessionId: 'sess_123',  // ❌ Cannot update key!
    accessToken: 'token',
    // ...
  }
});
```

**Correct** ✅:
```javascript
// Separate key from updates
const { sessionId, ...updates } = session;

await axios.put('/crud', {
  key: { sessionId: sessionId },
  updates: updates  // ✅ Key not included
});
```

## Prevention

The fix ensures:
- ✅ Consistent `sessionId` format: `sess_${accountId}`
- ✅ Separates key from updates (DynamoDB constraint)
- ✅ Uses UPDATE first, creates new only if doesn't exist
- ✅ Preserves original `createdAt` timestamp
- ✅ Updates `updatedAt` on each refresh
- ✅ No more 500 errors from DynamoDB

## Testing

1. Go to Kite Accounts page
2. Click "Get Access Token" for an account
3. Check `kite-sessions` table - should have ONE entry
4. Click "Refresh Access Token" again
5. Check `kite-sessions` table - should STILL have ONE entry (updated, not duplicated)

✅ **No more duplicates!**

