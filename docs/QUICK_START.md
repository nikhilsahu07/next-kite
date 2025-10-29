# 🚀 Quick Start Guide

## Your Application is Ready!

You now have a **multi-account portfolio management system** that works completely from the database - no more `.env` dependency!

## 🎯 What You Can Do Now

### 1️⃣ Add Your Zerodha Accounts

```bash
# Start the app
npm run dev

# Visit
http://localhost:3000/landing

# Click "Get Started" or "Start Trading"
# You'll be taken to /kite-accounts
```

**Add your accounts** by clicking "Add Account":
- Account Name (e.g., "Personal Trading")
- Client ID / Username
- Phone Number
- Password
- API Key
- API Secret
- Callback URL (auto-filled: `http://localhost:3000/kite-callback`)

### 2️⃣ Generate Session Tokens

For each account:
1. Click **"Get Session Token"**
2. Popup opens with Zerodha login
3. Enter your credentials + TOTP
4. Popup automatically closes
5. Session is saved to database ✅

### 3️⃣ Manage Accounts in Popups

**Open multiple accounts simultaneously!**

Click **"🔐 Manage Account"** on any active account:
- Opens in a new popup window
- View credentials
- Test connection
- Access quick actions
- **Open multiple popups** for different accounts

### 4️⃣ Use an Account for Trading

Click **"📈 Use for Trading"** on any active account:
- Sets that account as active
- Enables /dashboard access
- All trading uses this account
- Switch accounts anytime!

## 📊 What You'll See

### Kite Accounts Dashboard
```
┌─────────────────────────────────────────────┐
│  Kite Accounts                              │
│  Manage your trading accounts and sessions  │
│                                             │
│  [Refresh]  [Add Account]                   │
│                                             │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │
│  │  5  │ │  3  │ │  2  │ │  4  │          │
│  │Total│ │Active│ │Inact│ │Live │          │
│  └─────┘ └─────┘ └─────┘ └─────┘          │
│                                             │
│  ┌─── Account Card ─────────────────────┐  │
│  │ My Trading Account    🟢 Active       │  │
│  │ ABC123                                │  │
│  │                                       │  │
│  │ [Refresh Session] [🔐 Manage]        │  │
│  │ [📈 Use for Trading] [Edit] [▼]      │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### Manage Account Popup
```
┌─────────────────────────────────────────────┐
│ My Trading Account              [Close]     │
│ John Doe (john@example.com)                │
│ 🟢 Active                                   │
│                                             │
│ [Overview] [Credentials] [Test] [Trading]  │
│                                             │
│ Status: Active    Expires In: 20 hours     │
│ User Type: Individual    Broker: Zerodha   │
│                                             │
│ Quick Actions:                              │
│ [📊 Open Kite Dashboard]                   │
│ [🔧 Open Console]                          │
│ [🔄 Refresh Session]                       │
└─────────────────────────────────────────────┘
```

## 🔄 Typical Workflows

### Scenario 1: Managing 5 Family Accounts

```
1. Add all 5 accounts (one time setup)
2. Generate sessions for all 5
3. Click "Manage Account" on each
   → 5 popup windows open
4. Monitor all accounts simultaneously
5. Switch "Use for Trading" as needed
```

### Scenario 2: Switching Between Accounts

```
1. Currently using "Personal Trading"
2. Want to trade in "Day Trading" account
3. Click "Use for Trading" on "Day Trading"
4. Access /dashboard
5. All operations now use "Day Trading"
```

### Scenario 3: Session Expired

```
1. App detects expired session (auto-check every 5 min)
2. Status shows 🔴 Expired
3. Click "Refresh Session"
4. Login to Zerodha again
5. New 24-hour session generated
6. Back to trading! ✅
```

## 🎨 Account Status Meanings

| Status | What It Means | What To Do |
|--------|---------------|------------|
| 🟢 **Active** | Session valid (>2 hours left) | Trade freely! |
| 🟡 **Expiring Soon** | <2 hours remaining | Refresh soon |
| 🔴 **Expired** | >24 hours passed | Click "Refresh Session" |
| ⚪ **No Session** | Never generated | Click "Get Session Token" |

## 💡 Pro Tips

### Tip 1: Use Descriptive Names
```
Good: "Personal - Conservative", "Day Trading", "Options"
Bad: "Account 1", "Test", "ABC"
```

### Tip 2: Refresh Before Expiry
Set a reminder to refresh sessions every 20 hours (before 24-hour expiry)

### Tip 3: Organize Popups
Arrange popup windows side-by-side for easy monitoring

### Tip 4: Check Console
Console logs show session status checks every 5 minutes

### Tip 5: Bookmark /kite-accounts
Direct access to your accounts dashboard

## 🔐 Important Security Notes

✅ **DO:**
- Keep API secrets secure
- Refresh sessions regularly
- Use strong passwords
- Enable 2FA on Zerodha

❌ **DON'T:**
- Share access tokens
- Use same password everywhere
- Leave expired sessions unrefreshed
- Share your screen while managing accounts

## 🐛 Common Issues & Solutions

### Issue: "Popup blocked"
**Solution**: Allow popups for `localhost:3000` in browser settings

### Issue: "Session not saving"
**Solution**: 
1. Check backend is running (`brmh.in`)
2. Verify `NEXT_PUBLIC_BACKEND_URL` in `.env.local`
3. Check browser console for errors

### Issue: "Can't access dashboard"
**Solution**: Click "Use for Trading" on an active account first

### Issue: "Account not loading in popup"
**Solution**: 
1. Check account exists in database
2. Try refreshing the popup
3. Close and reopen the popup

## 📱 Browser Compatibility

✅ **Tested On:**
- Chrome (recommended)
- Edge
- Firefox
- Safari

⚠️ **Note**: Popup features work best on desktop browsers

## 🎯 Next Steps

### Immediate Actions:
1. ✅ Add your first account
2. ✅ Generate session token
3. ✅ Test manage account popup
4. ✅ Select for trading
5. ✅ Access dashboard

### Advanced Usage:
1. Add multiple accounts
2. Open multiple popups
3. Monitor all accounts
4. Switch between accounts
5. Track portfolio performance

### Future Enhancements (You Can Build):
1. Direct trading from popups
2. Portfolio aggregation view
3. Performance analytics
4. Auto-session refresh
5. Email notifications

## 📚 Documentation

- **Full System Docs**: `MULTI_ACCOUNT_PORTFOLIO_SYSTEM.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **Session Management**: `KITE_ACCOUNTS_SESSION_MANAGEMENT.md`
- **API Endpoints**: `docs/API_ENDPOINTS_GUIDE.md`

## 🎉 You're All Set!

Your multi-account portfolio management system is **production-ready** and fully functional.

**Start by visiting**: `http://localhost:3000/landing`

Happy Trading! 📈

---

**Need Help?**
- Check console logs (F12)
- Review documentation files
- Verify backend connectivity
- Test with a single account first

**Everything Working?**
Great! Now add all your accounts and start managing your portfolio! 🚀

