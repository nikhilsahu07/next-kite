# Quick Setup Guide - Kite Accounts Session Management

## 🚀 Quick Start (3 Steps)

### Step 1: Configure Zerodha App Redirect URL

**This is CRITICAL for the session token flow to work!**

1. Go to [Zerodha Developer Console](https://developers.kite.trade/apps)
2. Click on your app (or create a new one)
3. In the app settings, set the **Redirect URL** to:
   ```
   http://localhost:3000/kite-callback
   ```
   (Or for production: `https://yourdomain.com/kite-callback`)
4. Click **Save**

⚠️ **Important**: Each API key has only ONE redirect URL. Make sure it points to `/kite-callback`.

### Step 2: Add Your Account

1. Go to **Kite Accounts** page (`/kite-accounts`)
2. Click **"Add Account"**
3. Fill in the details:
   - **Account Name**: Give it a friendly name (e.g., "My Trading Account")
   - **Client ID**: Your Zerodha Client ID (e.g., ABC123)
   - **Phone Number**: Your registered phone number
   - **Password**: Your Zerodha password
   - **API Key**: From your Zerodha app
   - **API Secret**: From your Zerodha app
   - **Callback URL**: Should auto-fill to `http://localhost:3000/kite-callback`
4. Click **"Add Account"**

### Step 3: Get Session Token

1. Click **"Get Session Token"** on your account
2. A popup window will open → Zerodha login page
3. Enter your credentials
4. Enter TOTP code from your authenticator app
5. Click **Continue**
6. The popup will **automatically close**
7. Your session token is saved! ✅

That's it! You now have a 24-hour session token.

---

## 📋 How It Works

### The Flow:

```
1. Click "Get Session Token"
   ↓
2. Popup opens → Zerodha login page
   ↓
3. You enter: Username + Password + TOTP
   ↓
4. Zerodha redirects to: /kite-callback?request_token=xxx&state=accountId
   ↓
5. Callback page sends message to parent window
   ↓
6. Parent window calls API to exchange request_token for access_token
   ↓
7. Access token saved to database
   ↓
8. Popup closes automatically
   ↓
9. UI updates to show "Active" session ✅
```

### What Gets Saved:

```javascript
{
  sessionId: "sess_123...",
  accountId: "acc_456...",
  accessToken: "xyz789...",      // ← This is what you need for API calls!
  userId: "ABC123",
  userName: "Your Name",
  email: "you@example.com",
  expiresAt: 1234567890,         // ← 24 hours from now
  status: "active"
}
```

---

## 🔐 Using the Session Token

### Option 1: Manage Account Modal

1. Click **"🔐 Manage Account"** on an active session
2. Go to **"Credentials"** tab
3. Copy the **Access Token**
4. Use it in your API calls:

```javascript
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

### Option 2: Test Connection

1. Click **"🔐 Manage Account"**
2. Go to **"Test Connection"** tab
3. Click **"Test Connection"**
4. See if it works! ✅

---

## ❓ Troubleshooting

### Problem: "Popup blocked"
**Solution**: Allow popups for this site in your browser settings.

### Problem: "Redirected to wrong URL"
**Solution**: Check that your Zerodha app redirect URL is set to `/kite-callback` (not `/callback`).

### Problem: "Session not saving"
**Solution**: 
1. Check browser console for errors
2. Verify API Key and Secret are correct
3. Make sure the callback URL matches Zerodha settings

### Problem: "Popup doesn't close automatically"
**Solution**: 
1. Check if the redirect URL in Zerodha is correct
2. Look for JavaScript errors in console
3. Try allowing popups and refreshing

### Problem: "Session expired"
**Solution**: Click **"Refresh Session"** to get a new 24-hour token.

---

## 📊 Session Status Indicators

| Badge | Meaning | Action |
|-------|---------|--------|
| 🟢 **Active** | Session is valid | Use it for API calls |
| 🟡 **Expired** | Session expired (>24hrs) | Click "Refresh Session" |
| ⚪ **No Session** | No token yet | Click "Get Session Token" |

---

## 🔄 Session Refresh

Sessions expire after **24 hours**. To refresh:

1. Click **"Refresh Session"** button
2. Login again (same flow as getting session)
3. New 24-hour token is saved

💡 **Tip**: Set a reminder to refresh sessions every day to avoid downtime.

---

## 🎯 Multiple Accounts

You can manage **multiple accounts** simultaneously:

1. Each account has its own API credentials
2. Each account has its own session token
3. Sessions are independent (one account's session doesn't affect another)

**Example Use Cases:**
- Personal trading account
- Family member's account
- Different strategies (aggressive vs conservative)
- Testing vs production

---

## 🔒 Security Best Practices

1. ✅ Never share API keys or access tokens
2. ✅ Use environment variables for sensitive data
3. ✅ Refresh sessions regularly (don't let them expire)
4. ✅ Keep API secrets in the backend only
5. ✅ Use HTTPS in production
6. ✅ Monitor session usage

---

## 📝 Environment Variables

Make sure your `.env.local` (or `.env`) has:

```bash
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
```

The API endpoints will use this URL for CRUD operations.

---

## 🎉 You're All Set!

You can now:
- ✅ Save multiple Zerodha accounts
- ✅ Generate 24-hour session tokens
- ✅ Make API calls without re-entering credentials
- ✅ Manage accounts from one dashboard
- ✅ Test connections before trading

**Need help?** Check the console logs for detailed error messages!

