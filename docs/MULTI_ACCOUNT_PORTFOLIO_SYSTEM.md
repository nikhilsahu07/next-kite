# 🚀 Multi-Account Portfolio Management System

## Overview

This application has been transformed into a **comprehensive multi-account portfolio management system** that allows users to manage multiple Zerodha trading accounts from a single interface. All credentials and sessions are stored in a database, enabling true portfolio management across multiple accounts.

## ✨ Key Features

### 1. **Database-Driven Authentication**
- All account credentials (API keys, secrets, passwords) stored in DynamoDB
- No reliance on `.env` files for account management
- Secure storage with encrypted credentials

### 2. **Multi-Account Management**
- Add and manage unlimited Zerodha accounts
- Each account has independent credentials and sessions
- View all accounts in a unified dashboard

### 3. **Session Management**
- Automatic session generation and storage
- 24-hour session tokens with expiration tracking
- Auto-refresh notifications when sessions expire
- Real-time session status checking (every 5 minutes)

### 4. **Popup-Based Account Management**
- Open each account in a separate popup window
- Manage multiple accounts simultaneously
- Perfect for traders handling multiple portfolios
- Independent windows for each account

### 5. **Account Selection for Trading**
- Select which account to use for trading operations
- "Use for Trading" button sets active account
- Seamless switching between accounts
- Selected account credentials used for dashboard/trading

## 🏗️ Architecture

```
Landing Page (/landing)
    ↓ (Click "Get Started" or "Start Trading")
    ↓
Kite Accounts Dashboard (/kite-accounts)
    ↓
    ├─→ Add Account → Store in DynamoDB
    ├─→ Generate Session → Login → Save session to DB
    ├─→ Manage Account → Opens popup window (/manage-account?accountId=xxx)
    └─→ Use for Trading → Sets cookies for dashboard access
```

## 📁 Key Files & Components

### Frontend Pages

1. **`/app/landing/page.tsx`**
   - Landing page with "Get Started" and "Start Trading" buttons
   - **Redirects to**: `/kite-accounts` (not `/dashboard`)

2. **`/app/kite-accounts/page.tsx`**
   - Main accounts management dashboard
   - Features:
     - View all accounts with session status
     - Add new accounts
     - Edit existing accounts
     - Generate/refresh session tokens
     - Manage accounts (opens popup)
     - Select account for trading
     - Auto session checking (every 5 minutes)

3. **`/app/manage-account/page.tsx`** (NEW)
   - Dedicated page for managing individual accounts
   - Opens in popup window
   - Tabs:
     - **Overview**: Account status, quick actions
     - **Credentials**: View/copy API keys, access tokens
     - **Test Connection**: Verify session validity
     - **Trading**: (Coming soon) Direct trading interface

4. **`/app/kite-callback/page.tsx`**
   - OAuth callback handler
   - Captures request token from Zerodha
   - Sends message to parent window
   - Auto-closes after authentication

### API Endpoints

1. **`/api/kite-auth/generate-session`** (Existing)
   - Exchanges request token for access token
   - Uses account-specific API key and secret
   - Returns session data

2. **`/api/kite-auth/test-connection`** (Existing)
   - Tests if access token is valid
   - Fetches user profile from Kite API

3. **`/api/kite-auth/check-sessions`** (NEW)
   - Checks session status for all accounts
   - Returns expired/expiring/active status
   - Used for auto-checking sessions

4. **`/api/kite-auth/auto-session`** (NEW)
   - Helps with automatic session generation
   - Provides login URLs
   - Note: Full automation not possible (requires user TOTP)

5. **`/api/kite-auth/select-account`** (NEW)
   - **POST**: Selects account for trading
   - **GET**: Gets currently selected account
   - **DELETE**: Deselects account
   - Sets cookies for dashboard access

### Middleware

**`/middleware.ts`** (Updated)
- Allows public access to:
  - `/landing`
  - `/kite-accounts`
  - `/manage-account`
  - `/kite-callback`
  - `/api`
- Protected routes (`/dashboard`, `/positions`, etc.):
  - Redirects to `/kite-accounts` if no session
  - Supports legacy `.env` tokens for backward compatibility

### Database Tables

**DynamoDB Tables** (managed by `brmh.in` backend)

1. **`kite-accounts`**
   ```json
   {
     "accountId": "acc_xxx",
     "accountName": "My Trading Account",
     "clientId": "ABC123",
     "phoneNumber": "+91 9876543210",
     "password": "encrypted",
     "apiKey": "your_api_key",
     "apiSecret": "your_api_secret",
     "accountType": "live",
     "callbackUrl": "http://localhost:3000/kite-callback",
     "postbackUrl": "https://brmh.in/postback",
     "status": "active",
     "hasActiveSession": true,
     "session": { ... },
     "createdAt": 1234567890,
     "updatedAt": 1234567890,
     "lastLoginAt": 1234567890
   }
   ```

2. **`kite-sessions`**
   ```json
   {
     "sessionId": "sess_xxx",
     "accountId": "acc_xxx",
     "accessToken": "xyz789...",
     "requestToken": "abc123...",
     "userId": "ABC123",
     "userName": "John Doe",
     "email": "john@example.com",
     "userType": "individual",
     "broker": "ZERODHA",
     "loginTime": "2024-01-01T00:00:00+05:30",
     "ttl": 24,
     "expiresAt": 1234567890,
     "createdAt": 1234567890,
     "status": "active"
   }
   ```

## 🎯 User Flow

### 1. Landing Page → Accounts Dashboard

```
User clicks "Get Started" or "Start Trading"
    ↓
Redirects to /kite-accounts
```

### 2. Adding First Account

```
1. Click "Add Account" button
2. Fill in form:
   - Account Name (e.g., "My Trading Account")
   - Client ID / Username
   - Phone Number
   - Password
   - API Key
   - API Secret
   - Callback URL (auto-filled)
3. Click "Add Account"
4. Account saved to DynamoDB
```

### 3. Generating Session Token

```
1. Click "Get Session Token" on account
2. Popup opens → Zerodha login page
3. Enter credentials + TOTP
4. Zerodha redirects to /kite-callback
5. Callback captures request token
6. Exchange request token for access token
7. Session saved to database
8. Popup closes automatically
9. Account shows "Active" status
```

### 4. Managing Account in Popup

```
1. Click "🔐 Manage Account" on active account
2. New popup window opens (/manage-account?accountId=xxx)
3. View credentials, test connection, access quick actions
4. Can open multiple popups for different accounts
5. Each popup operates independently
```

### 5. Using Account for Trading

```
1. Click "📈 Use for Trading" on active account
2. Account credentials set in cookies
3. Can now access /dashboard, /positions, /holdings, /orders
4. All trading operations use selected account
5. Switch accounts anytime by selecting different account
```

## 🔐 Security Features

- **Encrypted Storage**: All credentials stored securely in DynamoDB
- **Session Expiry**: 24-hour automatic expiration
- **Token Isolation**: Each account has independent tokens
- **Cookie Security**: HTTP-only, secure cookies for selected account
- **No .env Dependency**: No sensitive data in code or environment files

## 📊 Account Status Indicators

| Badge | Meaning | Action Required |
|-------|---------|-----------------|
| 🟢 **Active** | Session is valid (>2 hours remaining) | Ready to trade |
| 🟡 **Expiring Soon** | Session expires in <2 hours | Refresh session recommended |
| 🔴 **Expired** | Session expired (>24 hours) | Click "Refresh Session" |
| ⚪ **No Session** | No token generated yet | Click "Get Session Token" |

## 🚀 Getting Started

### Prerequisites

1. **Backend Running**: Ensure `brmh.in` backend is accessible
2. **Environment Variable**: Set in `.env.local`:
   ```bash
   NEXT_PUBLIC_BACKEND_URL=https://brmh.in
   ```

### Setup Steps

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Navigate to landing page**:
   ```
   http://localhost:3000/landing
   ```

3. **Click "Get Started"** → Redirects to `/kite-accounts`

4. **Add your first account**:
   - Click "Add Account"
   - Fill in Zerodha credentials
   - Save account

5. **Generate session**:
   - Click "Get Session Token"
   - Login to Zerodha
   - Session automatically saved

6. **Select for trading**:
   - Click "Use for Trading"
   - Access dashboard and trading features

## 🎨 UI Components

### Account Card

Each account is displayed as a card showing:
- Account name and client ID
- Session status badge
- Account type (Live/Sandbox)
- Action buttons:
  - **Get/Refresh Session Token**
  - **🔐 Manage Account** (opens popup)
  - **📈 Use for Trading** (selects account)
  - **Edit** (modify account details)
  - **Expand** (view full details)

### Statistics Dashboard

Shows at a glance:
- **Total Accounts**: Number of accounts added
- **Active Sessions**: Accounts with valid sessions
- **Inactive**: Accounts without sessions
- **Live Accounts**: Production accounts (vs sandbox)

## 🔄 Session Auto-Checking

The system automatically checks session status:
- **Frequency**: Every 5 minutes
- **On Page Load**: When accounts are loaded
- **Notifications**: Console logs for expired/expiring sessions

## 🪟 Multi-Window Management

### Why Popup Windows?

1. **Multi-Account Trading**: Manage multiple accounts simultaneously
2. **Independent Windows**: Each account in its own window
3. **Better Organization**: Keep accounts separate
4. **Flexibility**: Arrange windows as needed

### Popup Features

- **Size**: 1200x800 (optimized for content)
- **Position**: Centered on screen
- **Resizable**: Yes
- **Scrollable**: Yes
- **Unique Name**: Each popup named `manage_${accountId}`

## 📝 Best Practices

### For Users

1. **Regular Session Refresh**: Refresh sessions before they expire
2. **Multiple Accounts**: Use different accounts for different strategies
3. **Account Names**: Use descriptive names (e.g., "Conservative Portfolio", "Day Trading")
4. **Security**: Don't share access tokens or API secrets
5. **Popup Permissions**: Allow popups for the site

### For Developers

1. **Database-First**: All account data should go through database
2. **No Hardcoding**: Never hardcode credentials in code
3. **Session Validation**: Always check session expiry before API calls
4. **Error Handling**: Gracefully handle expired sessions
5. **Cleanup**: Remove expired sessions from database

## 🐛 Troubleshooting

### "Popup blocked"
**Solution**: Allow popups for this site in browser settings

### "Session expired"
**Solution**: Click "Refresh Session" to generate new token

### "Failed to load account"
**Solution**: Check that backend is running and accessible

### "Connection failed"
**Solution**: Verify API key and secret are correct

### "No accounts found"
**Solution**: Click "Add Account" to add your first account

## 🔮 Future Enhancements

1. **Direct Trading Interface**: Trade directly from manage-account popup
2. **Portfolio Aggregation**: Combined view of all accounts
3. **Performance Analytics**: Track performance across accounts
4. **Auto Session Renewal**: Auto-refresh sessions when possible
5. **Account Groups**: Organize accounts into groups
6. **Export/Import**: Backup and restore account data
7. **Activity Log**: Track all actions per account
8. **Notifications**: Browser notifications for session expiry

## 📚 API Documentation

### Account Selection

**Select Account for Trading**:
```javascript
POST /api/kite-auth/select-account
Body: {
  accountId: "acc_xxx",
  accessToken: "token_xxx",
  apiKey: "key_xxx"
}
Response: {
  success: true,
  message: "Account selected for trading",
  accountId: "acc_xxx"
}
```

**Get Selected Account**:
```javascript
GET /api/kite-auth/select-account
Response: {
  success: true,
  selectedAccount: {
    accountId: "acc_xxx",
    hasToken: true,
    hasApiKey: true
  }
}
```

**Deselect Account**:
```javascript
DELETE /api/kite-auth/select-account
Response: {
  success: true,
  message: "Account deselected"
}
```

### Session Checking

**Check All Sessions**:
```javascript
POST /api/kite-auth/check-sessions
Body: {
  accounts: [ /* array of account objects */ ]
}
Response: {
  success: true,
  results: [
    {
      accountId: "acc_xxx",
      status: "active",
      needsRefresh: false,
      hoursRemaining: 20.5
    }
  ],
  summary: {
    total: 5,
    active: 3,
    needsRefresh: 2
  }
}
```

## 🎉 Summary

This multi-account portfolio management system provides:

✅ **Database-driven authentication** - No .env dependency  
✅ **Multi-account support** - Unlimited accounts  
✅ **Auto session management** - Expiry tracking & notifications  
✅ **Popup-based management** - Independent windows  
✅ **Account selection** - Easy switching for trading  
✅ **Secure storage** - Encrypted credentials in DynamoDB  
✅ **Real-time status** - Auto-checking every 5 minutes  
✅ **Professional UI** - Modern, responsive design  

Perfect for traders managing multiple Zerodha accounts from one centralized platform! 🚀

