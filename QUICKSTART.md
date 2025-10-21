# Quick Start Guide - Personal Use

This guide is for using the app to view **your own** Zerodha trading data.

## Step-by-Step Instructions

### Step 1: Get Your Access Token

Run the authentication script:

```bash
npm run auth
```

This will:
1. Display a login URL
2. You open it in your browser
3. Login with your Zerodha credentials
4. Copy the `request_token` from the redirected URL
5. Paste it in the terminal
6. Your `access_token` will be saved automatically

### Step 2: View Your Data (CLI)

To quickly view your trading data in the terminal:

```bash
npm run fetch-data
```

This will display:
- Your profile information
- Account margins
- Current positions
- Holdings with P&L
- Order history
- Live market quotes

### Step 3: View Your Data (Web UI)

Start the web application:

```bash
npm run dev
```

Then open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) in your browser.

**Note:** You can skip the login page and go directly to `/dashboard` since your token is already configured.

## Example: Complete Flow

```bash
# 1. Install dependencies (first time only)
npm install

# 2. Authenticate with Zerodha
npm run auth
# Follow the prompts to login and get your token

# 3. View your data in terminal
npm run fetch-data

# 4. Or start the web app
npm run dev
# Visit http://localhost:3000/dashboard
```

## Important Notes

### Token Expiry
- Access tokens expire **daily** at market close
- When expired, simply run `npm run auth` again
- The new token will automatically update

### Direct URL Access
Since you're viewing your own data, you can bookmark these URLs:

- Dashboard: `http://localhost:3000/dashboard`
- Positions: `http://localhost:3000/positions`
- Holdings: `http://localhost:3000/holdings`
- Orders: `http://localhost:3000/orders`

### Manual Login Process

If you prefer to get the token manually:

1. Open this URL in your browser:
   ```
   https://kite.zerodha.com/connect/login?api_key=h4wkw57p0r9qppx2&v=3
   ```

2. Login with your credentials

3. After login, you'll be redirected to a URL like:
   ```
   http://127.0.0.1:3000/api/auth/callback?request_token=ABC123XYZ&action=login&status=success
   ```

4. Copy the `request_token` value (e.g., `ABC123XYZ`)

5. Run `npm run auth` and paste the token when prompted

## Troubleshooting

### "Token is invalid" error
- The request token expires quickly (a few minutes)
- Get a fresh token by logging in again

### "Not authenticated" error in web app
- Run `npm run auth` to get a fresh access token
- Check that `.env.local` contains `KITE_ACCESS_TOKEN`

### Data not showing
- Verify you're logged into the correct Zerodha account
- Check if you have active positions/holdings to display

## Environment Variables

Your `.env.local` file should contain:

```env
KITE_API_KEY=h4wkw57p0r9qppx2
KITE_API_SECRET=ioc97qnesxr8u9psjfd4jcsgb19mag15
KITE_REDIRECT_URL=http://127.0.0.1:3000/api/auth/callback
ZERODHA_CLIENT_ID=OW4258
KITE_ACCESS_TOKEN=your_token_here (added after running npm run auth)
KITE_USER_ID=your_user_id (added after running npm run auth)
NEXT_PUBLIC_KITE_API_KEY=h4wkw57p0r9qppx2
```

## Need Help?

Common commands:
- `npm run auth` - Get new access token
- `npm run fetch-data` - View data in terminal
- `npm run dev` - Start web interface
- `npm run build` - Build for production

For Kite Connect API documentation: https://kite.trade/docs/connect/v3/

