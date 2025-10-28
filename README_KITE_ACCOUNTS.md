# 🚀 Kite Accounts Management System

A comprehensive system for managing multiple Kite trading accounts with secure credential storage and session management.

## ⚡ Quick Start

1. **Check Configuration:**
   ```bash
   npx tsx setup-kite-accounts.ts
   ```

2. **Start the Application:**
   ```bash
   npm run dev
   ```

3. **Access the Dashboard:**
   - Navigate to: http://localhost:3000/kite-accounts
   - Add your first Kite account
   - Login and start trading!

## 🏗️ Architecture

```
Next.js Frontend (localhost:3000)
         ↓
   brmh.in Backend API (https://brmh.in)
         ↓
    DynamoDB Tables
    ├── kite-accounts
    └── kite-sessions
```

## 📁 Key Files

- **`app/kite-accounts/page.tsx`** - Main dashboard component
- **`components/Navbar.tsx`** - Navigation with Kite Accounts link
- **`.env.local`** - Frontend configuration
- **`setup-kite-accounts.ts`** - Configuration checker

## 🔧 Configuration

### Frontend (.env.local)
```bash
NEXT_PUBLIC_BACKEND_URL=https://brmh.in
```

### Backend (brmh.in)
- All backend configuration is handled by brmh.in
- No local setup required

## ✨ Features

- ✅ **Multi-Account Support** - Manage multiple Kite accounts
- ✅ **Secure Storage** - Encrypted credentials in DynamoDB
- ✅ **Session Management** - 24-hour auto-expiring tokens
- ✅ **Copyable Fields** - Easy credential copying
- ✅ **Connection Testing** - Verify access tokens
- ✅ **Professional UI** - Modern, responsive design
- ✅ **Dark Mode** - Full theme support

## 📚 Documentation

- **Quick Start:** `QUICK_START_GUIDE.md`
- **Full Setup:** `KITE_ACCOUNTS_SETUP.md`
- **Integration:** `INTEGRATION_SUMMARY.md`

## 🚨 Troubleshooting

### "Network Error" or "Connection Refused"
- Ensure brmh.in backend is running and accessible
- Check that `NEXT_PUBLIC_BACKEND_URL=https://brmh.in` in `.env.local`

### "Table not found"
- Tables are managed by the brmh.in backend
- No local DynamoDB setup required

### "Encryption key missing"
- Backend encryption is handled by brmh.in
- No local configuration needed

## 🎯 Usage

1. **Add Account:** Click "Add New Account" button
2. **Fill Details:** Enter client ID, password, API keys
3. **Login:** Click "🔐 Login" to authenticate with Kite
4. **Test Connection:** Verify the access token works
5. **Use Account:** Access profile data and API endpoints

## 🔒 Security

- **AES-256-CBC Encryption** for sensitive credentials
- **Separate Sessions Table** for access tokens
- **Automatic Expiry** with DynamoDB TTL
- **Reveal/Hide Toggle** for sensitive data

## 🎨 UI Features

- **Account Cards** with status indicators
- **Copyable Fields** with one-click copying
- **Expandable Details** for full information
- **Connection Status** with real-time updates
- **Professional Design** with modern styling

---

**Ready to start?** Run `npx tsx setup-kite-accounts.ts` to check your configuration!
