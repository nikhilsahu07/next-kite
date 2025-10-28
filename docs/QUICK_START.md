# 🚀 Quick Start Guide - Kite Account Management

## ⚡ 3-Step Setup

### Step 1: Create Database Tables (ONE TIME)
```bash
node create-all-kite-tables.js
```

This creates:
- ✅ `kite-accounts` - Account credentials storage
- ✅ `kite-sessions` - Access token management (24-hour TTL)

### Step 2: Update Environment Variables
Edit `.env` and change the encryption key:
```env
KITE_ENCRYPTION_KEY=your-secure-32-character-key-here
```

**⚠️ IMPORTANT:** Use a strong, random 32-character string!

### Step 3: Start the Server
```bash
npm start
```

Server runs at: `http://localhost:5001`

---

## 🎯 Quick Test

### 1. Create Your First Account

```bash
curl -X POST http://localhost:5001/kite/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "clientId": "YOUR_CLIENT_ID",
    "password": "your_password",
    "apiKey": "your_api_key",
    "apiSecret": "your_api_secret",
    "accountName": "My First Account",
    "accountType": "live",
    "phoneNumber": "+919876543210"
  }'
```

Copy the `accountId` from the response.

### 2. Get Login URL

```bash
curl http://localhost:5001/kite/auth/login-url/YOUR_ACCOUNT_ID
```

Open the returned URL in your browser and complete OAuth login.

### 3. Exchange Request Token

After OAuth redirect, you'll get a `request_token`. Use it:

```bash
curl -X POST http://localhost:5001/kite/auth/callback \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "YOUR_ACCOUNT_ID",
    "requestToken": "REQUEST_TOKEN_FROM_CALLBACK"
  }'
```

### 4. Verify Connection

```bash
curl -X POST http://localhost:5001/kite/auth/validate/YOUR_ACCOUNT_ID
```

Should return: `"connected": true` ✅

### 5. Get Your Profile

```bash
curl http://localhost:5001/kite/profile/YOUR_ACCOUNT_ID
```

---

## 📊 Use the Dashboard

### React Component

```jsx
import KiteAccountsDashboard from './KiteAccountsDashboard';

function App() {
  return <KiteAccountsDashboard userId="test-user" />;
}
```

Features:
- ✅ View all accounts with credentials
- ✅ Copy any field with one click
- ✅ Show/hide passwords & secrets
- ✅ Test connections
- ✅ Login to accounts
- ✅ View raw JSON data
- ✅ Session status indicators
- ✅ API endpoint URLs

---

## 📁 File Structure

```
next-kite/
├── create-kite-accounts-table.js    # Creates accounts table
├── create-kite-sessions-table.js    # Creates sessions table
├── create-all-kite-tables.js        # Creates all tables at once
├── kite-crud.js                     # CRUD operations
├── kite-api.js                      # Kite Connect API wrapper
├── index.js                         # Updated with Kite endpoints
├── KiteAccountsDashboard.jsx        # Professional React UI
├── KITE_SETUP_README.md            # Complete documentation
├── API_ENDPOINTS_GUIDE.md          # API reference
├── QUICK_START.md                   # This file
└── .env                             # Updated with encryption key
```

---

## 🔑 API Endpoints Summary

### Account Management
- `POST /kite/accounts` - Create account
- `GET /kite/accounts/:accountId` - Get account
- `GET /kite/accounts/user/:userId` - Get user's accounts
- `GET /kite/accounts/user/:userId/with-sessions` - Accounts with sessions
- `PUT /kite/accounts/:accountId` - Update account
- `DELETE /kite/accounts/:accountId` - Delete account

### Authentication
- `GET /kite/auth/login-url/:accountId` - Get login URL
- `POST /kite/auth/callback` - Exchange request token
- `POST /kite/auth/validate/:accountId` - Test connection
- `POST /kite/auth/logout/:accountId` - Logout
- `POST /kite/auth/refresh/:accountId` - Refresh token

### Kite Data APIs
- `GET /kite/profile/:accountId` - User profile
- `GET /kite/holdings/:accountId` - Holdings
- `GET /kite/positions/:accountId` - Positions
- `GET /kite/orders/:accountId` - Orders
- `POST /kite/orders/:accountId` - Place order
- `GET /kite/quote/:accountId` - Get quotes
- `GET /kite/ltp/:accountId` - Last traded price
- `GET /kite/margins/:accountId` - Margins

---

## 🔒 Security Features

1. **Encrypted Storage**
   - Passwords encrypted with AES-256-CBC
   - API secrets encrypted
   - Unique IV for each encryption

2. **Session Management**
   - 24-hour token expiry
   - Automatic cleanup via DynamoDB TTL
   - Invalid sessions marked and excluded

3. **Secure by Default**
   - Secrets masked by default (`********`)
   - Use `?includeSecrets=true` to reveal
   - Dashboard has reveal/hide toggles

---

## 🎓 Common Use Cases

### Use Case 1: Multi-Account Trading
```javascript
// Get all accounts
const accounts = await fetch('http://localhost:5001/kite/accounts/user/myUserId/with-sessions')
  .then(r => r.json());

// Place same order on all active accounts
for (const account of accounts.accounts.filter(a => a.hasActiveSession)) {
  await fetch(`http://localhost:5001/kite/orders/${account.accountId}`, {
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
}
```

### Use Case 2: Auto-Login on Token Expiry
```javascript
async function makeKiteRequest(accountId, endpoint) {
  const response = await fetch(`http://localhost:5001${endpoint}`);
  const data = await response.json();
  
  if (data.requiresLogin) {
    // Token expired, redirect to login
    window.open(data.loginUrl, '_blank');
    // Wait for user to complete OAuth...
    // Then retry the request
  }
  
  return data;
}
```

### Use Case 3: Scheduled Token Refresh
```javascript
// Check all accounts every hour and refresh if needed
setInterval(async () => {
  const accounts = await fetch('http://localhost:5001/kite/accounts/user/myUserId/with-sessions')
    .then(r => r.json());
  
  for (const account of accounts.accounts) {
    if (account.session && account.session.expiresAt - Date.now() < 3600000) { // < 1 hour left
      console.log(`Token expiring soon for ${account.accountName}, needs refresh`);
      // Notify user or auto-refresh
    }
  }
}, 3600000); // Check every hour
```

---

## 🐛 Troubleshooting

### Problem: Table creation fails
```bash
# Check AWS credentials
echo $AWS_ACCESS_KEY_ID
echo $AWS_SECRET_ACCESS_KEY
echo $AWS_REGION

# Verify tables exist
aws dynamodb list-tables --region us-east-1
```

### Problem: Encryption/Decryption errors
```bash
# Check if encryption key is set
grep KITE_ENCRYPTION_KEY .env

# Key must be same across all instances
# Changing key will break existing encrypted data
```

### Problem: No active session
```bash
# Get login URL
curl http://localhost:5001/kite/auth/login-url/ACCOUNT_ID

# Complete OAuth login
# Exchange request token
```

---

## 📚 Full Documentation

- **KITE_SETUP_README.md** - Complete setup guide with detailed explanations
- **API_ENDPOINTS_GUIDE.md** - All API endpoints with curl examples
- **KiteAccountsDashboard.jsx** - React component documentation

---

## ✅ Checklist

Before going to production:

- [ ] Created DynamoDB tables
- [ ] Changed `KITE_ENCRYPTION_KEY` to secure random string
- [ ] Tested account creation
- [ ] Tested OAuth login flow
- [ ] Tested token expiry handling
- [ ] Implemented proper error handling
- [ ] Set up HTTPS (production)
- [ ] Configured CORS properly
- [ ] Added rate limiting
- [ ] Set up monitoring/logging
- [ ] Backed up credentials
- [ ] Tested with sandbox accounts first

---

## 🎉 You're Ready!

All systems are set up. Now you can:

1. ✅ Store multiple Kite accounts securely
2. ✅ Manage 24-hour access tokens automatically
3. ✅ View all credentials in professional dashboard
4. ✅ Copy any field with one click
5. ✅ Test connections anytime
6. ✅ Use all Kite Connect APIs seamlessly

**Happy Trading! 🚀📈**

---

For support, check:
- Console logs for errors
- DynamoDB tables for data
- API response messages
- Browser console in dashboard

