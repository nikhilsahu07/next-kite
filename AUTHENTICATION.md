# Kite Connect Authentication Flow

## Understanding the Flow

Kite Connect uses OAuth2 authentication. Here's how it works:

### Step 1: Get Request Token (via Login)

**URL Format:**
```
https://kite.zerodha.com/connect/login?api_key=YOUR_API_KEY&v=3
```

**Your URL:**
```
https://kite.zerodha.com/connect/login?api_key=h4wkw57p0r9qppx2&v=3
```

When you visit this URL:
1. Zerodha shows their login page
2. You enter your credentials (User ID, Password, 2FA)
3. After successful login, Zerodha redirects to your callback URL with a `request_token`

**Redirect URL will look like:**
```
http://127.0.0.1:3000/?request_token=ABC123XYZ&action=login&status=success
```

### Step 2: Exchange Request Token for Access Token

Now use the `request_token` + `api_secret` to get the `access_token`:

```javascript
const session = await kiteConnect.generateSession(request_token, api_secret);
```

**Response includes:**
```json
{
  "user_id": "AB1234",
  "user_name": "Your Name",
  "email": "you@example.com",
  "access_token": "long_token_string",
  "public_token": "public_token_string",
  "enctoken": "encrypted_token",
  "refresh_token": null  // ⚠️ Kite doesn't provide refresh tokens
}
```

### Step 3: Use Access Token

Use the `access_token` for all subsequent API calls:

```javascript
kiteConnect.setAccessToken(access_token);

// Now you can make API calls
const profile = await kiteConnect.getProfile();
const positions = await kiteConnect.getPositions();
```

## ⚠️ Important Notes

### No Refresh Token
- **Kite Connect DOES NOT provide refresh tokens**
- Access tokens expire **daily** around market close
- You must re-authenticate every day to get a new token

### Request Token Expiry
- Request tokens expire **within a few minutes**
- Must be exchanged quickly for access token
- Cannot reuse the same request token

### Token Storage
- Store `access_token` securely (environment variables, encrypted storage)
- Never commit tokens to version control
- Tokens are user-specific and account-specific

## 🚀 Automated Methods

### Method 1: Automated OAuth Server (Recommended)

```bash
npm run auth-server
```

**What it does:**
1. Starts a local HTTP server on port 3000
2. Opens Zerodha login page in your browser
3. Automatically captures the `request_token`
4. Exchanges it for `access_token`
5. Saves token to `.env.local`
6. Shuts down automatically

**Perfect for:** Personal use, quick authentication

### Method 2: Manual CLI

```bash
npm run auth
```

**What it does:**
1. Shows you the login URL
2. You manually open it and login
3. Copy the `request_token` from redirected URL
4. Paste it in the terminal
5. Saves token to `.env.local`

**Perfect for:** When port 3000 is in use, debugging

## 📝 Complete Example

### Using the Automated Server

```bash
# Terminal 1: Run auth server
cd kite-trading-app
npm run auth-server

# Server starts, browser opens automatically
# Login with Zerodha credentials
# Token is saved automatically
# Server shuts down

# Terminal 1: View your data
npm run fetch-data

# Or start the web app
npm run dev
```

### Manual Token Exchange (Code Example)

```typescript
import { KiteConnect } from 'kiteconnect';

const kc = new KiteConnect({ 
  api_key: 'h4wkw57p0r9qppx2' 
});

// Step 1: User visits login URL
const loginUrl = `https://kite.zerodha.com/connect/login?api_key=h4wkw57p0r9qppx2&v=3`;

// Step 2: After login, get request_token from redirect
const requestToken = 'token_from_redirect_url';

// Step 3: Exchange for access_token
const session = await kc.generateSession(
  requestToken,
  'ioc97qnesxr8u9psjfd4jcsgb19mag15' // api_secret
);

// Step 4: Set and use access_token
kc.setAccessToken(session.access_token);

// Step 5: Make API calls
const profile = await kc.getProfile();
console.log(profile);
```

## 🔄 Daily Re-authentication

Since tokens expire daily, you need to re-authenticate:

```bash
# Every day (or when token expires)
npm run auth-server

# Then continue using the app
npm run dev
```

## 🔒 Security Best Practices

1. **Never commit tokens to git**
   - `.env.local` is in `.gitignore`
   - Never share your tokens publicly

2. **Use environment variables**
   ```env
   KITE_API_KEY=h4wkw57p0r9qppx2
   KITE_API_SECRET=ioc97qnesxr8u9psjfd4jcsgb19mag15
   KITE_ACCESS_TOKEN=generated_token_here
   ```

3. **Store tokens securely**
   - HTTP-only cookies for web apps
   - Encrypted storage for mobile apps
   - Environment variables for servers

4. **Handle token expiry**
   ```javascript
   try {
     const data = await kc.getProfile();
   } catch (error) {
     if (error.message.includes('session')) {
       // Token expired, re-authenticate
       console.log('Please run: npm run auth-server');
     }
   }
   ```

## 🐛 Troubleshooting

### "Token is invalid" error
- Request token expired (they only last a few minutes)
- Get a fresh token by logging in again

### "Port 3000 already in use"
- Stop any running server on port 3000
- Or use the manual method: `npm run auth`

### Access token not working
- Token might have expired (daily expiry)
- Run `npm run auth-server` to get a new token

### Redirect URL mismatch
- Ensure your app redirect URL matches: `http://127.0.0.1:3000`
- Verify in your Kite Connect app settings on Zerodha

## 📚 References

- [Kite Connect Documentation](https://kite.trade/docs/connect/v3/)
- [Authentication Flow](https://kite.trade/docs/connect/v3/user/#login-flow)
- [API Documentation](https://kite.trade/docs/connect/v3/user/)

