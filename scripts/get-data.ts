/**
 * Quick script to fetch your Kite data using stored access token
 * Run: npm run fetch-data
 */

import { KiteConnect } from 'kiteconnect';

const apiKey = process.env.KITE_API_KEY || 'h4wkw57p0r9qppx2';
const accessToken = process.env.KITE_ACCESS_TOKEN;

if (!accessToken) {
  console.error('❌ No access token found!');
  console.log('Please run: npm run auth');
  process.exit(1);
}

const kc = new KiteConnect({ api_key: apiKey });
kc.setAccessToken(accessToken);

async function fetchAllData() {
  console.log('\n=== Fetching Your Kite Trading Data ===\n');

  try {
    // Profile
    console.log('📊 Fetching Profile...');
    const profile = await kc.getProfile();
    console.log('User:', profile.user_name, `(${profile.user_id})`);
    console.log('Email:', profile.email);
    console.log('Broker:', profile.broker);
    console.log('Exchanges:', profile.exchanges.join(', '));

    // Margins
    console.log('\n💰 Fetching Margins...');
    const margins = await kc.getMargins();
    if (margins.equity) {
      console.log('Equity Available:', '₹' + margins.equity.net.toFixed(2));
      console.log('Equity Used:', '₹' + margins.equity.utilised.debits.toFixed(2));
    }
    if (margins.commodity) {
      console.log('Commodity Available:', '₹' + margins.commodity.net.toFixed(2));
    }

    // Positions
    console.log('\n📈 Fetching Positions...');
    const positions = await kc.getPositions();
    if (positions.net.length > 0) {
      console.log('Net Positions:', positions.net.length);
      positions.net.forEach((pos: any) => {
        const pnlColor = pos.pnl >= 0 ? '\x1b[32m' : '\x1b[31m';
        console.log(`  ${pos.tradingsymbol} (${pos.exchange}): ${pos.quantity} @ ₹${pos.average_price.toFixed(2)} | P&L: ${pnlColor}₹${pos.pnl.toFixed(2)}\x1b[0m`);
      });
    } else {
      console.log('No open positions');
    }

    // Holdings
    console.log('\n💼 Fetching Holdings...');
    const holdings = await kc.getHoldings();
    if (holdings.length > 0) {
      console.log('Total Holdings:', holdings.length);
      const totalValue = holdings.reduce((sum: number, h: any) => sum + (h.last_price * h.quantity), 0);
      const totalPnL = holdings.reduce((sum: number, h: any) => sum + h.pnl, 0);
      console.log('Portfolio Value:', '₹' + totalValue.toFixed(2));
      const pnlColor = totalPnL >= 0 ? '\x1b[32m' : '\x1b[31m';
      console.log(`Total P&L: ${pnlColor}₹${totalPnL.toFixed(2)}\x1b[0m`);
      
      holdings.forEach((holding: any) => {
        const pnlColor = holding.pnl >= 0 ? '\x1b[32m' : '\x1b[31m';
        console.log(`  ${holding.tradingsymbol}: ${holding.quantity} @ ₹${holding.average_price.toFixed(2)} | LTP: ₹${holding.last_price.toFixed(2)} | P&L: ${pnlColor}₹${holding.pnl.toFixed(2)}\x1b[0m`);
      });
    } else {
      console.log('No holdings found');
    }

    // Orders
    console.log('\n📝 Fetching Orders...');
    const orders = await kc.getOrders();
    if (orders.length > 0) {
      console.log('Total Orders:', orders.length);
      const completed = orders.filter((o: any) => o.status === 'COMPLETE').length;
      const pending = orders.filter((o: any) => o.status === 'OPEN' || o.status === 'PENDING').length;
      const rejected = orders.filter((o: any) => o.status === 'REJECTED' || o.status === 'CANCELLED').length;
      console.log(`  ✅ Completed: ${completed}`);
      console.log(`  ⏳ Pending: ${pending}`);
      console.log(`  ❌ Rejected/Cancelled: ${rejected}`);
    } else {
      console.log('No orders found');
    }

    // Recent Quotes
    console.log('\n💹 Fetching Live Quotes...');
    const quotes = await kc.getLTP(['NSE:RELIANCE', 'NSE:SBIN', 'NSE:INFY', 'NSE:TCS', 'NSE:HDFCBANK']);
    console.log('Live Market Prices:');
    Object.entries(quotes).forEach(([symbol, data]: [string, any]) => {
      console.log(`  ${symbol}: ₹${data.last_price.toFixed(2)}`);
    });

    console.log('\n✅ Data fetch complete!\n');

  } catch (error: any) {
    console.error('\n❌ Error fetching data:', error.message);
    if (error.message.includes('session') || error.message.includes('token')) {
      console.log('\n⚠️  Your access token might have expired.');
      console.log('Please run: npm run auth\n');
    }
  }
}

fetchAllData();

