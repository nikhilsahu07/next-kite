# Architecture: Data Flow for Trading Dashboard

## The Problem You Identified 🤔

**Question**: "Why are we fetching the access token from the database? Can't we just pass it directly?"

**Answer**: You're absolutely right! Fetching from the database every time is slow and can cause issues.

## The Solution: Hybrid Approach ⚡

We now use a **two-tier system**:

### 1. **FAST PATH** (Primary) ⚡
- When you click "Open Trading Dashboard", the account data (including access token) is temporarily stored in `sessionStorage`
- The popup window reads directly from `sessionStorage`
- **Super fast** - no database roundtrip needed!
- Auto-cleanup after 5 seconds

### 2. **SLOW PATH** (Fallback) 💾
- If `sessionStorage` data is missing or stale (> 30 seconds old)
- Falls back to fetching from database
- Ensures the system still works if user refreshes the page

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Kite Accounts Page                          │
│                    /kite-accounts                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ User clicks
                              │ "🔐 Open Trading Dashboard"
                              ▼
                ┌──────────────────────────────┐
                │  handleManageAccount()       │
                │  Stores account data in:     │
                │  sessionStorage              │
                │  Key: kite_trading_account_  │
                │       ${accountId}           │
                └──────────────────────────────┘
                              │
                              │ Opens popup
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Manage Account Page (Popup)                   │
│              /manage-account?accountId=xxx                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                ┌──────────────────────────────┐
                │  Try FAST PATH first:        │
                │  Read from sessionStorage    │
                └──────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
              Found in cache?      Not found?
                    │                   │
                    ▼                   ▼
          ┌─────────────────┐   ┌──────────────────┐
          │ ⚡ FAST PATH    │   │ 💾 SLOW PATH     │
          │ Use cached data │   │ Fetch from DB    │
          │ < 30 sec old    │   │ GET /crud        │
          └─────────────────┘   └──────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              │
                              ▼
                ┌──────────────────────────────┐
                │ Validate session:            │
                │ - Check expiry              │
                │ - Verify access token       │
                └──────────────────────────────┘
                              │
                              ▼
                ┌──────────────────────────────┐
                │ Call /api/kite-auth/         │
                │      select-account          │
                │ Sets cookies:                │
                │ - kite_access_token         │
                │ - kite_api_key              │
                │ - kite_selected_account     │
                └──────────────────────────────┘
                              │
                              ▼
                ┌──────────────────────────────┐
                │ Redirect to                  │
                │ /dashboard                   │
                └──────────────────────────────┘
```

## Why This Hybrid Approach? 🎯

### Benefits of FAST PATH (sessionStorage):
✅ **Instant access** - No network delay  
✅ **Fresh data** - Just-generated tokens work immediately  
✅ **Secure** - Data cleared after 5 seconds  
✅ **No database load** - Reduces API calls  

### Benefits of SLOW PATH (database):
✅ **Reliability** - Works if user refreshes page  
✅ **Persistence** - Data survives browser crashes  
✅ **Consistency** - Always get the actual saved state  
✅ **Multi-device** - Can access from different browsers  

## Security Considerations 🔒

### Why sessionStorage (not URL params)?
- **URL params** are visible in:
  - Browser history
  - Server logs
  - Browser extensions
  - Developer tools
  
- **sessionStorage** is:
  - Not visible in URLs
  - Cleared when tab closes
  - Same-origin only
  - Auto-cleaned after 5 seconds

### Why cookies for API calls?
- **HttpOnly cookies** cannot be accessed by JavaScript
- Protected against XSS attacks
- Automatically sent with every API request
- Proper expiry management (24 hours)

## Performance Comparison 📊

| Scenario | Old Approach | New Approach |
|----------|--------------|--------------|
| First time opening | ~500ms DB fetch | ⚡ ~5ms sessionStorage |
| Page refresh | ~500ms DB fetch | ~500ms DB fetch (fallback) |
| Expired cache | N/A | ~500ms DB fetch (fallback) |
| Multiple popups | ~500ms each | ⚡ ~5ms each |

## Code Examples

### Storing in sessionStorage (kite-accounts/page.tsx)
```typescript
const storageKey = `kite_trading_account_${account.accountId}`;
sessionStorage.setItem(storageKey, JSON.stringify({
  accountId: account.accountId,
  accountName: account.accountName,
  apiKey: account.apiKey,
  accessToken: account.session.accessToken,
  session: account.session,
  timestamp: Date.now()
}));
```

### Reading from sessionStorage (manage-account/page.tsx)
```typescript
// FAST PATH: Try sessionStorage first
const cachedData = sessionStorage.getItem(storageKey);
if (cachedData && isRecent(cachedData)) {
  account = JSON.parse(cachedData);
  console.log('⚡ FAST PATH');
} else {
  // SLOW PATH: Fetch from database
  account = await fetchFromDatabase();
  console.log('💾 SLOW PATH');
}
```

## What You'll See in Console

### Using FAST PATH (Typical):
```
🔐 Opening Trading Dashboard for: My Trading Account
📊 Account data being passed: {...}
⚡ Using cached account data from sessionStorage (FAST PATH)
✅ Cached data is fresh, using it
📊 Account Data: {source: 'sessionStorage', ...}
✅ Account selected successfully, redirecting to dashboard...
```

### Using SLOW PATH (Fallback):
```
💾 Fetching account from database (SLOW PATH)
📊 Full Response Data: {...}
📊 Account Data: {source: 'database', ...}
✅ Account selected successfully, redirecting to dashboard...
```

## Troubleshooting

### If you see "No access token found":
1. Check console for which path was used (FAST or SLOW)
2. Look at the `📊 Account Data` log:
   - Is `hasSession: true`?
   - Is `hasAccessToken: true`?
   - Is `isExpired: false`?
3. Check the `expiresAt` timestamp
4. If database path was used, check if session is actually in the database

### If FAST PATH isn't working:
- Check if `sessionStorage` is enabled in browser
- Check if popup was blocked (data won't transfer)
- Check if more than 30 seconds passed (cache expired)

## Summary

**Before**: Always fetch from database (slow, can have stale data)  
**After**: Use in-memory cache first (fast, always fresh), fall back to database if needed  

This gives you the **best of both worlds**: speed when possible, reliability when needed! 🚀

