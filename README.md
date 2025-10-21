# Kite Trading App

A modern, full-featured trading application built with Next.js 15, TypeScript, and the Kite Connect API from Zerodha.

## Features

- 🔐 **Secure Authentication** - OAuth2 login flow with Zerodha
- 📊 **Real-time Market Data** - Live ticker updates using WebSocket
- 💼 **Portfolio Management** - View positions, holdings, and orders
- 📈 **Live Quotes** - Real-time price updates for multiple instruments
- 💰 **Account Information** - View margins and account details
- 🎨 **Modern UI** - Beautiful interface built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API Integration**: Kite Connect API
- **Real-time Data**: Kite Ticker (WebSocket)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Zerodha Kite Connect API account
- API Key and API Secret from Zerodha

### Installation

1. Clone the repository or navigate to the project directory:
```bash
cd kite-trading-app
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:

Create a `.env.local` file in the root directory with the following variables:

```env
KITE_API_KEY=your_api_key
KITE_API_SECRET=your_api_secret
KITE_REDIRECT_URL=http://127.0.0.1:3000/api/auth/callback
ZERODHA_CLIENT_ID=your_client_id
NEXT_PUBLIC_KITE_API_KEY=your_api_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
kite-trading-app/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── profile/      # User profile
│   │   ├── positions/    # Trading positions
│   │   ├── holdings/     # Stock holdings
│   │   ├── orders/       # Order management
│   │   ├── quotes/       # Market quotes
│   │   └── margins/      # Account margins
│   ├── dashboard/        # Dashboard page
│   ├── positions/        # Positions page
│   ├── holdings/         # Holdings page
│   ├── orders/           # Orders page
│   └── layout.tsx        # Root layout
├── components/
│   ├── Navbar.tsx        # Navigation component
│   └── TickerDisplay.tsx # Real-time ticker display
├── hooks/
│   └── useTicker.ts      # Custom hook for WebSocket ticker
├── lib/
│   ├── kite-service.ts   # Kite Connect API wrapper
│   └── ticker-service.ts # Kite Ticker service
├── types/
│   └── kite.ts           # TypeScript type definitions
└── .env.local            # Environment variables (not in git)
```

## Features in Detail

### 1. Dashboard
- User profile information
- Account margins (Equity & Commodity)
- Live market data for popular stocks
- Quick access to all features

### 2. Positions
- View all open positions (Net & Day)
- Real-time P&L updates
- Detailed position information

### 3. Holdings
- Complete portfolio view
- Total investment and current value
- Individual stock P&L
- Day change percentages

### 4. Orders
- All order history
- Order status tracking
- Detailed order information
- Summary statistics

### 5. Live Market Data
- Real-time price updates via WebSocket
- OHLC (Open, High, Low, Close) data
- Volume information
- Price change indicators

## API Routes

- `GET /api/auth/login` - Get Kite login URL
- `GET /api/auth/callback` - Handle OAuth callback
- `POST /api/auth/logout` - Logout user
- `GET /api/profile` - Get user profile
- `GET /api/margins` - Get account margins
- `GET /api/positions` - Get trading positions
- `GET /api/holdings` - Get stock holdings
- `GET /api/orders` - Get/Place orders
- `GET /api/quotes` - Get market quotes

## Authentication Flow

1. User clicks "Login with Zerodha"
2. Redirected to Zerodha login page
3. After login, Zerodha redirects back with `request_token`
4. App exchanges `request_token` for `access_token`
5. `access_token` stored in HTTP-only cookie
6. User redirected to dashboard

## Security Notes

- API credentials stored in environment variables
- Access tokens stored in HTTP-only cookies
- HTTPS recommended for production
- Never commit `.env.local` to version control

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Important Notes

1. **Sandbox vs Production**: Make sure you're using the correct API endpoints (sandbox for testing, production for live trading)
2. **Rate Limits**: Be aware of Kite Connect API rate limits
3. **WebSocket Limits**: Kite Ticker has connection limits
4. **Session Expiry**: Access tokens expire daily, requiring re-login

## Troubleshooting

### Common Issues

1. **Authentication fails**: 
   - Verify API key and secret are correct
   - Check redirect URL matches exactly

2. **WebSocket not connecting**:
   - Ensure access token is valid
   - Check API key is correct

3. **API calls failing**:
   - Verify you're logged in
   - Check access token hasn't expired
   - Ensure account has necessary permissions

## License

This project is for educational purposes. Please review Zerodha's terms of service before using in production.

## Support

For issues related to:
- Kite Connect API: [Kite Connect Documentation](https://kite.trade/docs/connect/v3/)
- This project: Open an issue on GitHub

## Disclaimer

This is a sample application for educational purposes. Trading in financial markets involves risk. Use at your own discretion. The developers are not responsible for any financial losses.
