# Kite Accounts - Session Management System

## Overview
This document explains the improved session token management system for Kite accounts, which allows you to manage multiple Zerodha trading accounts with persistent 24-hour sessions.

## What's New

### 1. **Proper Session Token Generation**
- When you click "Get Session Token", a popup window opens for Zerodha login
- After successful login, the system:
  - Captures the `request_token` from the redirect URL
  - Exchanges it for an actual `access_token` using the Kite API
  - Stores the complete session data in the `kite-sessions` table
  - Automatically closes the popup window
  - Updates the UI to show the active session

### 2. **Session Data Storage**
Each session now stores:
- `sessionId`: Unique identifier for the session
- `accountId`: Link to the account
- `accessToken`: Valid access token for API calls (24-hour validity)
- `requestToken`: The original request token
- `userId`: Zerodha user ID
- `userName`: User's full name
- `email`: User's email
- `userType`: Account type (individual, etc.)
- `broker`: Broker name
- `loginTime`: When the session was created
- `expiresAt`: When the session expires (24 hours from creation)
- `status`: Session status (active/expired)

### 3. **Manage Account Feature**
For accounts with active sessions, a **"🔐 Manage Account"** button appears with three tabs:

#### **Overview Tab**
- Shows session status and expiration time
- Quick links to:
  - Kite Dashboard
  - Zerodha Console

#### **Credentials Tab**
- Displays all API credentials
- Shows how to use them in API calls
- Example authorization header format

#### **Test Connection Tab**
- Test button to verify session is working
- Fetches user profile to confirm credentials
- Shows success/error response

## How It Works

### Authentication Flow

1. **Initial Setup**
   ```
   User adds account → Provides credentials (API Key, Secret, etc.)
   ```

2. **Getting Session Token**
   ```
   Click "Get Session Token" 
   → Opens Zerodha login popup
   → User enters credentials + TOTP
   → Zerodha redirects with request_token
   → System exchanges request_token for access_token
   → Session saved to database
   → Popup closes automatically
   → UI updates to show active session
   ```

3. **Session Lifecycle**
   ```
   Session created → Valid for 24 hours → Expires
   → Can refresh by clicking "Refresh Session" button
   ```

## API Endpoints

### `/api/kite-auth/generate-session` (POST)
Exchanges request_token for access_token using account-specific API credentials.

**Request Body:**
```json
{
  "requestToken": "xyz123...",
  "apiKey": "account_api_key",
  "apiSecret": "account_api_secret"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "abc...",
    "user_id": "ABC123",
    "user_name": "John Doe",
    "email": "john@example.com",
    "user_type": "individual",
    "broker": "ZERODHA",
    "login_time": "2024-01-01T10:00:00Z"
  }
}
```

## Database Schema

### kite-accounts Table
```javascript
{
  accountId: string,          // Primary key
  accountName: string,
  clientId: string,
  phoneNumber: string,
  password: string,           // Encrypted
  apiKey: string,
  apiSecret: string,          // Encrypted
  accountType: 'live' | 'sandbox',
  callbackUrl: string,
  postbackUrl: string,
  session: {                  // Embedded session object
    sessionId: string,
    accessToken: string,
    userId: string,
    userName: string,
    email: string,
    expiresAt: number,
    // ... other session fields
  },
  hasActiveSession: boolean,
  lastLoginAt: number,
  createdAt: number,
  updatedAt: number
}
```

### kite-sessions Table
```javascript
{
  sessionId: string,          // Primary key
  accountId: string,          // Foreign key
  accessToken: string,
  requestToken: string,
  userId: string,
  userName: string,
  userShortname: string,
  email: string,
  userType: string,
  broker: string,
  loginTime: string,
  ttl: number,                // Hours
  expiresAt: number,          // Timestamp
  createdAt: number,
  status: 'active' | 'expired'
}
```

## Usage Examples

### 1. Managing Multiple Accounts
```javascript
// Add multiple accounts with different credentials
Account 1: Personal Trading Account
- API Key: xyz123
- Session: Active (expires in 22 hours)
- Status: 🟢 Ready to trade

Account 2: Investment Account  
- API Key: abc456
- Session: Active (expires in 18 hours)
- Status: 🟢 Ready to trade
```

### 2. Making API Calls with Saved Sessions
```javascript
// Using the stored access token
const response = await fetch('https://api.kite.trade/orders', {
  method: 'POST',
  headers: {
    'X-Kite-Version': '3',
    'Authorization': `token ${apiKey}:${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    tradingsymbol: 'INFY',
    exchange: 'NSE',
    transaction_type: 'BUY',
    quantity: 1,
    order_type: 'MARKET',
    product: 'CNC'
  })
});
```

### 3. Session Auto-Refresh
```javascript
// Check if session is about to expire (< 2 hours left)
if (session.expiresAt - Date.now() < 2 * 60 * 60 * 1000) {
  // Click "Refresh Session" to get a new 24-hour token
  handleGetSession(account);
}
```

## Security Features

1. **No Credentials in Frontend**
   - API Secret is only used server-side for token generation
   - Access tokens are stored securely

2. **Session Expiration**
   - Automatic expiration after 24 hours
   - Clear visual indicators of session status

3. **Per-Account Credentials**
   - Each account uses its own API Key/Secret
   - Isolated sessions prevent cross-contamination

## UI Indicators

### Session Status Colors
- 🟢 **Green Badge**: Active session (valid)
- 🟡 **Yellow Badge**: Session expired
- ⚪ **Gray Badge**: No session yet

### Account Card Features
- **Session Status**: Active/Expired/None
- **Time Remaining**: Shows hours until expiration
- **Last Login**: Timestamp of last session creation
- **Manage Button**: Only visible for active sessions

## Troubleshooting

### Session Not Saving
1. Check that the popup window is not blocked by browser
2. Verify API Key and Secret are correct
3. Check browser console for errors
4. Ensure the backend URL is accessible

### Popup Not Closing
- The system now automatically closes the popup after successful login
- If it doesn't close, check for browser popup blocker settings

### "Session Expired" Error
- Click "Refresh Session" to get a new token
- This will require re-entering Zerodha credentials

### Test Connection Fails
1. Verify the session hasn't expired
2. Check if API credentials are correct
3. Ensure Zerodha API is accessible
4. Try refreshing the session

## Best Practices

1. **Refresh Sessions Proactively**
   - Refresh sessions before they expire (ideally every 20-22 hours)

2. **Monitor Session Status**
   - Check the dashboard regularly for expiring sessions

3. **Test Before Trading**
   - Use "Test Connection" before making important trades

4. **Keep Credentials Secure**
   - Never share API keys or access tokens
   - Use environment variables for sensitive data

5. **Handle Multiple Accounts**
   - Use descriptive account names
   - Note which account is for which purpose

## Future Enhancements

Potential features for future updates:
- Auto-refresh sessions before expiration
- Email notifications for expiring sessions
- Trading dashboard per account
- Portfolio aggregation across accounts
- Automated trading rules per account

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Test with a single account first
4. Check Zerodha API status page

