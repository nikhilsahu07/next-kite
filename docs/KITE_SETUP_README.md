# Kite Account Management System - Complete Setup Guide

## 📋 Overview

A comprehensive Kite Connect account management system with:
- **Secure credential storage** (encrypted passwords & API secrets)
- **Automatic token management** (24-hour session lifecycle)
- **Professional dashboard UI** (React component with copyable credentials)
- **Complete API integration** (all Kite Connect endpoints)
- **DynamoDB backend** (scalable, serverless storage)

---

## 🚀 Quick Start

### 1. Create DynamoDB Tables

Run the table creation scripts to set up the required database tables:

```bash
# Create individual tables
node create-kite-accounts-table.js
node create-kite-sessions-table.js

# Or create all tables at once
node create-all-kite-tables.js
```

This will create:
- **`kite-accounts`** - Stores account credentials (encrypted passwords & secrets)
- **`kite-sessions`** - Stores access tokens with 24-hour TTL

### 2. Environment Variables

Add these to your `.env` file:

```env
# Kite Account Management
KITE_ENCRYPTION_KEY=your-32-character-encryption-key-here-change-this

# AWS Configuration (if not already set)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

**⚠️ IMPORTANT:** Change `KITE_ENCRYPTION_KEY` to a secure 32-character random string!

### 3. Start the Server

```bash
npm start
```

The API will be available at `http://localhost:5001`

### 4. Use the Dashboard

Import and use the React component in your app:

```jsx
import KiteAccountsDashboard from './KiteAccountsDashboard';

function App() {
  const userId = 'your-user-id'; // Get from authentication
  
  return <KiteAccountsDashboard userId={userId} />;
}
```

---

## 📊 Database Schema

### kite-accounts Table

| Field | Type | Description |
|-------|------|-------------|
| `accountId` | String (PK) | Unique account identifier (UUID) |
| `userId` | String | Owner user ID |
| `clientId` | String | Kite client ID / username |
| `phoneNumber` | String | Phone number (optional) |
| `password` | String | **Encrypted** password |
| `apiKey` | String | Kite API key |
| `apiSecret` | String | **Encrypted** API secret |
| `accountName` | String | Display name for account |
| `accountType` | String | `live` or `sandbox` |
| `status` | String | `active` or `inactive` |
| `createdAt` | String | ISO timestamp |
| `updatedAt` | String | ISO timestamp |
| `metadata` | Object | Additional account info |

**Global Secondary Indexes:**
- `userId-index` - Query accounts by user
- `clientId-index` - Query accounts by client ID
- `phoneNumber-index` - Query accounts by phone

### kite-sessions Table

| Field | Type | Description |
|-------|------|-------------|
| `sessionId` | String (PK) | Unique session identifier (UUID) |
| `accountId` | String | Associated account ID |
| `userId` | String | Owner user ID |
| `accessToken` | String | Kite access token |
| `refreshToken` | String | Kite refresh token (if available) |
| `requestToken` | String | Kite request token |
| `enctoken` | String | Kite encrypted token |
| `createdAt` | String | Token creation timestamp |
| `expiresAt` | Number | Token expiry timestamp (24 hours) |
| `ttl` | Number | Unix timestamp for auto-deletion |
| `status` | String | `active`, `expired`, or `invalid` |
| `lastUsed` | String | Last usage timestamp |
| `metadata` | Object | Additional session info |

**Global Secondary Indexes:**
- `accountId-index` - Query sessions by account
- `userId-index` - Query sessions by user
- `expiresAt-index` - Query sessions by expiry

**TTL:** Enabled on `ttl` field for automatic cleanup of expired sessions

---

## 🔌 API Endpoints

### Account Management

#### Create Account
```http
POST /kite/accounts
Content-Type: application/json

{
  "userId": "user123",
  "clientId": "ABC123",
  "phoneNumber": "+919876543210",
  "password": "mypassword",
  "apiKey": "your_api_key",
  "apiSecret": "your_api_secret",
  "accountName": "My Trading Account",
  "accountType": "live"
}
```

#### Get Account
```http
GET /kite/accounts/:accountId?includeSecrets=true
```

#### Get User's Accounts
```http
GET /kite/accounts/user/:userId?includeSecrets=true
```

#### Get User's Accounts with Sessions
```http
GET /kite/accounts/user/:userId/with-sessions?includeSecrets=true
```

#### Update Account
```http
PUT /kite/accounts/:accountId
Content-Type: application/json

{
  "accountName": "Updated Name",
  "status": "active"
}
```

#### Delete Account
```http
DELETE /kite/accounts/:accountId
```

### Session Management

#### Create Session
```http
POST /kite/sessions
Content-Type: application/json

{
  "accountId": "account-uuid",
  "userId": "user123",
  "accessToken": "token_here",
  "requestToken": "request_token_here"
}
```

#### Get Active Session
```http
GET /kite/sessions/account/:accountId/active
```

#### Get All Account Sessions
```http
GET /kite/sessions/account/:accountId
```

#### Invalidate Session
```http
POST /kite/sessions/:sessionId/invalidate
```

#### Cleanup Expired Sessions
```http
POST /kite/sessions/cleanup
```

### Authentication & Tokens

#### Get Login URL
```http
GET /kite/auth/login-url/:accountId
```

Response:
```json
{
  "success": true,
  "loginUrl": "https://kite.zerodha.com/connect/login?api_key=..."
}
```

#### Handle OAuth Callback
```http
POST /kite/auth/callback
Content-Type: application/json

{
  "accountId": "account-uuid",
  "requestToken": "request_token_from_callback"
}
```

#### Validate Connection
```http
POST /kite/auth/validate/:accountId
```

#### Logout
```http
POST /kite/auth/logout/:accountId
```

#### Refresh Token
```http
POST /kite/auth/refresh/:accountId
Content-Type: application/json

{
  "requestToken": "new_request_token"
}
```

### Kite API Data Endpoints

#### Get User Profile
```http
GET /kite/profile/:accountId
```

#### Get Holdings
```http
GET /kite/holdings/:accountId
```

#### Get Positions
```http
GET /kite/positions/:accountId
```

#### Get Orders
```http
GET /kite/orders/:accountId
```

#### Place Order
```http
POST /kite/orders/:accountId
Content-Type: application/json

{
  "exchange": "NSE",
  "tradingsymbol": "INFY",
  "transaction_type": "BUY",
  "quantity": 1,
  "order_type": "MARKET",
  "product": "CNC"
}
```

#### Get Instruments
```http
GET /kite/instruments/:accountId?exchange=NSE
```

#### Get Quote
```http
GET /kite/quote/:accountId?instruments=NSE:INFY,NSE:TCS
```

#### Get LTP (Last Traded Price)
```http
GET /kite/ltp/:accountId?instruments=NSE:INFY
```

#### Get OHLC
```http
GET /kite/ohlc/:accountId?instruments=NSE:INFY
```

#### Get Historical Data
```http
GET /kite/historical/:accountId/:instrumentToken/:interval?from=2024-01-01&to=2024-01-31
```

#### Get Margins
```http
GET /kite/margins/:accountId?segment=equity
```

---

## 🔐 Security Features

### 1. **Password & Secret Encryption**
- All passwords and API secrets are encrypted using AES-256-CBC
- Encryption key is stored in environment variables (not in code)
- Each encrypted value has a unique initialization vector (IV)

### 2. **Session Management**
- Access tokens stored with 24-hour expiry
- Automatic token refresh on expiry
- Invalid sessions are marked and excluded from queries
- DynamoDB TTL automatically deletes old sessions

### 3. **Credential Masking**
- By default, passwords and secrets are masked (`********`)
- Pass `includeSecrets=true` query parameter to reveal (use carefully!)

### 4. **API Key Protection**
- API keys and secrets never logged
- Dashboard has reveal/hide toggles for sensitive data
- Copy functionality for secure credential sharing

---

## 🎨 Dashboard Features

### Professional UI Components

1. **Account Cards**
   - Gradient headers with status badges
   - Quick action buttons (Login, Test, Delete)
   - Expandable detail sections
   - Connection status testing

2. **Copyable Credentials**
   - One-click copy for all fields
   - Visual feedback on copy
   - Reveal/hide toggles for secrets
   - Raw JSON export

3. **Real-time Session Status**
   - Active/Expired/No Session indicators
   - Countdown to expiry
   - Last used timestamps
   - Session refresh actions

4. **API Endpoint URLs**
   - Pre-configured endpoint URLs
   - Copy & test directly
   - OpenAPI compatible

5. **Stats Dashboard**
   - Total accounts count
   - Active sessions count
   - Inactive accounts count
   - Live vs Sandbox breakdown

---

## 🔄 Token Lifecycle

### Automatic Token Management

```
1. User clicks "Login" → Opens Kite OAuth
2. User authorizes → Redirected with request_token
3. Frontend calls /kite/auth/callback with accountId + requestToken
4. Backend generates access_token (valid 24 hours)
5. Session stored in kite-sessions with expiresAt timestamp
6. All API calls automatically use valid token
7. If token expired → Returns requiresLogin: true
8. User re-authenticates → New token generated
9. Old session marked as 'expired'
10. DynamoDB TTL deletes old session after 48 hours
```

### Token Validation Flow

```javascript
// Every API call:
1. Get active session for account
2. Check if expiresAt > now
3. If valid → Use access_token
4. If expired → Invalidate session
5. Return requiresLogin with loginUrl
6. User must re-authenticate
```

---

## 📝 Usage Examples

### Example 1: Add Account & Login

```javascript
// 1. Create account
const response = await fetch('http://localhost:5001/kite/accounts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    clientId: 'ABC123',
    password: 'mypassword',
    apiKey: 'your_api_key',
    apiSecret: 'your_api_secret',
    accountName: 'My Trading Account',
    accountType: 'live'
  })
});

const { accountId } = await response.json();

// 2. Get login URL
const loginResponse = await fetch(`http://localhost:5001/kite/auth/login-url/${accountId}`);
const { loginUrl } = await loginResponse.json();

// 3. Open login URL
window.open(loginUrl, '_blank');

// 4. After OAuth callback, exchange request_token
const tokenResponse = await fetch('http://localhost:5001/kite/auth/callback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    accountId,
    requestToken: 'request_token_from_callback'
  })
});

// Now you can make API calls!
```

### Example 2: Get Holdings

```javascript
const response = await fetch(`http://localhost:5001/kite/holdings/${accountId}`);
const data = await response.json();

if (data.success) {
  console.log('Holdings:', data.data);
} else if (data.requiresLogin) {
  // Token expired, need to re-login
  window.open(data.loginUrl, '_blank');
}
```

### Example 3: Place Order

```javascript
const orderResponse = await fetch(`http://localhost:5001/kite/orders/${accountId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    exchange: 'NSE',
    tradingsymbol: 'INFY',
    transaction_type: 'BUY',
    quantity: 1,
    order_type: 'MARKET',
    product: 'CNC'
  })
});

const result = await orderResponse.json();
console.log('Order placed:', result);
```

---

## 🛠️ Development Tips

### Enable Debug Logging

```javascript
// In kite-crud.js or kite-api.js
console.log('[Kite API] Request:', endpoint, data);
console.log('[Kite API] Response:', response.data);
```

### Test Connection

```bash
# Test if account is connected
curl -X POST http://localhost:5001/kite/auth/validate/account-uuid
```

### View Raw Account Data

```bash
# Get account with secrets
curl "http://localhost:5001/kite/accounts/account-uuid?includeSecrets=true"
```

### Cleanup Expired Sessions

```bash
# Manually trigger cleanup
curl -X POST http://localhost:5001/kite/sessions/cleanup
```

---

## 🐛 Troubleshooting

### Issue: "Account not found"
- Check if accountId is correct
- Verify the account exists in DynamoDB

### Issue: "No active session found"
- Session may have expired (24-hour limit)
- User needs to login again
- Get login URL from `/kite/auth/login-url/:accountId`

### Issue: "Invalid access token"
- Token may have been revoked by Kite
- Session marked as 'invalid'
- User needs to re-authenticate

### Issue: "Encryption/Decryption error"
- Check `KITE_ENCRYPTION_KEY` in .env
- Key must be consistent across all instances
- Changing the key will break existing encrypted data

### Issue: "DynamoDB table not found"
- Run the table creation scripts
- Check AWS credentials and region
- Verify table names match exactly

---

## 📦 Dependencies

```json
{
  "@aws-sdk/client-dynamodb": "^3.x.x",
  "@aws-sdk/lib-dynamodb": "^3.x.x",
  "axios": "^1.x.x",
  "uuid": "^9.x.x",
  "crypto": "built-in",
  "react": "^18.x.x" (for dashboard)
}
```

---

## 🎯 Best Practices

1. **Never commit .env files** - Keep encryption keys secret
2. **Use includeSecrets=true sparingly** - Only when necessary
3. **Implement proper authentication** - Secure userId verification
4. **Monitor session expiry** - Warn users before token expires
5. **Log all API errors** - Track failed authentication attempts
6. **Backup credentials** - Export account data periodically
7. **Test in sandbox first** - Before using live accounts
8. **Rate limiting** - Implement rate limits for API calls
9. **CORS configuration** - Secure API access in production
10. **HTTPS only** - Never use HTTP in production

---

## 📄 License

MIT

---

## 🤝 Support

For issues or questions:
- Check this README first
- Review API response error messages
- Check browser console for errors
- Verify AWS credentials and permissions
- Test with Kite's API documentation

---

## 🚀 Next Steps

After setup:
1. ✅ Create DynamoDB tables
2. ✅ Configure environment variables
3. ✅ Start the server
4. ✅ Add your first account via dashboard
5. ✅ Test connection
6. ✅ Start trading!

---

**🎉 You're all set! Happy Trading!**

