# 🎯 Kite Account Management System - Setup Guide

## Overview
This system allows you to manage multiple Kite trading accounts with their credentials, API keys, and access tokens stored securely in DynamoDB via the brmh.in backend.

## Architecture

```
Next.js Frontend (localhost:3000)
         ↓
   brmh.in Backend API (https://brmh.in)
         ↓
    DynamoDB Tables
    ├── kite-accounts
    └── kite-sessions
```

## Prerequisites

1. **Backend Server Running**
   - Your brmh.in backend server must be running and accessible at `https://brmh.in`
   - The server already has all the Kite account management endpoints
   
2. **DynamoDB Tables Created**
   - Tables are managed by the brmh.in backend
   - No local setup required

3. **Environment Variables**
   - Backend encryption is handled by brmh.in
   - No local configuration needed

## How It Works

### 1. Account Storage
- Client ID, username, phone number, password, API keys, and secrets are stored in DynamoDB
- Sensitive data (passwords, API keys, secrets) are encrypted using AES-256-CBC
- Each account gets a unique `accountId`

### 2. Session Management
- Access tokens are stored in the `kite-sessions` table
- Sessions automatically expire after 24 hours (TTL)
- System tracks active sessions per account

### 3. Frontend Integration
- New page: `/kite-accounts` - Professional dashboard for managing accounts
- Integrated into the existing Next.js Kite trading app
- Uses axios to call brmh.in backend API endpoints

## Available API Endpoints

All endpoints are on the brmh.in backend (`https://brmh.in`):

### Account Management
- `POST /kite/accounts` - Create new account
- `GET /kite/accounts/:accountId` - Get account details
- `GET /kite/accounts/user/:userId` - Get all accounts for a user
- `GET /kite/accounts/user/:userId/with-sessions` - Get accounts with sessions
- `PUT /kite/accounts/:accountId` - Update account
- `DELETE /kite/accounts/:accountId` - Delete account

### Authentication & Sessions
- `GET /kite/auth/login-url/:accountId` - Generate Kite login URL
- `POST /kite/auth/callback` - Handle OAuth callback
- `POST /kite/auth/validate/:accountId` - Test connection
- `POST /kite/auth/logout/:accountId` - Logout
- `POST /kite/auth/refresh/:accountId` - Refresh access token

### Kite API Data
- `GET /kite/profile/:accountId` - Get user profile
- `GET /kite/holdings/:accountId` - Get holdings
- `GET /kite/positions/:accountId` - Get positions
- `GET /kite/orders/:accountId` - Get orders
- `POST /kite/orders/:accountId` - Place order
- `GET /kite/margins/:accountId` - Get margins
- And more...

## Usage Flow

### 1. Start the Backend Server
```bash
cd /path/to/backend
npm start
# Server should be running on localhost:5001
```

### 2. Start the Next.js App
```bash
cd /home/nikhil/next-kite
npm run dev
# App runs on localhost:3000
```

### 3. Add a New Kite Account
1. Navigate to `http://localhost:3000/kite-accounts`
2. Click "➕ Add Account"
3. Fill in the form:
   - Account Name (e.g., "My Trading Account")
   - Client ID (Zerodha Client ID)
   - Phone Number
   - Password (Zerodha password)
   - API Key (from Kite Connect app)
   - API Secret (from Kite Connect app)
   - Account Type (Live/Sandbox)
4. Click "Add Account"

### 4. Login to Kite
1. Click "🔐 Login" button on an account card
2. Complete the Kite OAuth flow in the new tab
3. After successful login, the access token will be saved
4. Session will be active for 24 hours

### 5. Test Connection
1. Click "🔍 Test Connection" to verify the access token works
2. View the connection status and user profile info

### 6. Use the Account
- Click "📊 View Profile" to see raw Kite API data
- Copy credentials by clicking the copy button next to each field
- Expand the card to see full details, session info, and API endpoints
- All sensitive data is hidden by default (click 👁️ to reveal)

## Features

### Dashboard Features
✅ **Multi-Account Support** - Manage multiple Kite accounts
✅ **Secure Credential Storage** - Encrypted passwords and API keys
✅ **Session Management** - Auto-expiring tokens with TTL
✅ **Copyable Fields** - Easy copying of credentials and URLs
✅ **Connection Testing** - Verify access tokens work
✅ **Dark Mode Support** - Full dark/light theme support
✅ **Professional UI** - Clean, modern interface with stats
✅ **Raw API Access** - View and copy API endpoint URLs
✅ **Full Data Visibility** - Expand cards to see everything

### Security Features
🔒 **AES-256-CBC Encryption** - For sensitive credentials
🔒 **Separate Sessions Table** - Access tokens stored separately
🔒 **Automatic Expiry** - DynamoDB TTL for 24-hour sessions
🔒 **Reveal/Hide Toggle** - Sensitive data hidden by default

## File Structure

```
next-kite/
├── app/
│   └── kite-accounts/
│       └── page.tsx           # Main Kite Accounts Dashboard
├── components/
│   └── Navbar.tsx             # Updated with Kite Accounts link
├── .env.local                 # Frontend environment variables
└── KITE_ACCOUNTS_SETUP.md     # This file

backend/ (brmh.in)
├── index.js                   # Backend with /kite/* routes
├── kite-crud.js               # CRUD operations for accounts/sessions
├── kite-api.js                # Kite API integration
├── create-kite-accounts-table.js
├── create-kite-sessions-table.js
└── create-all-kite-tables.js
```

## Configuration

### Backend (.env)
```bash
# Required for encryption
KITE_ENCRYPTION_KEY=your-32-character-random-string-here

# AWS credentials (if not using default)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
```

### Frontend (.env.local)
```bash
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=https://brmh.in
```

## Troubleshooting

### Backend Not Running
**Error:** Cannot connect to `https://brmh.in`
**Solution:** Ensure brmh.in backend is running and accessible

### DynamoDB Tables Missing
**Error:** Table not found
**Solution:** Tables are managed by the brmh.in backend

### Encryption Key Missing
**Error:** KITE_ENCRYPTION_KEY not set
**Solution:** Backend encryption is managed by brmh.in

### Access Token Expired
**Error:** TokenException or 401 errors
**Solution:** Click "🔐 Login" button again to refresh the token

### Cannot See Accounts
**Issue:** Accounts list is empty
**Check:**
1. Backend server is running
2. DynamoDB tables exist
3. Correct `userId` is being used (default: 'user123')

## Next Steps

1. **Integrate with Auth System**
   - Replace hardcoded `userId` with actual authenticated user ID
   - Use your existing auth system (Cognito, JWT, etc.)

2. **Production Deployment**
   - Update `NEXT_PUBLIC_API_URL` to production URL
   - Ensure backend is deployed and accessible
   - Use strong `KITE_ENCRYPTION_KEY`

3. **Add Features**
   - Account switching in the main app
   - Bulk operations (login all accounts)
   - Export/import account configurations
   - Account usage statistics

## Support

For API endpoint details, see `API_ENDPOINTS_GUIDE.md`

For backend details, see `KITE_SETUP_README.md`

---

**🎯 You're all set! Navigate to http://localhost:3000/kite-accounts to start managing your Kite accounts!**

