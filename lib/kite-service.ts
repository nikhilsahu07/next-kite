import { KiteConnect } from 'kiteconnect';

let kiteInstance: any | null = null;

export function getKiteInstance(): any {
  if (!kiteInstance) {
    const apiKey = process.env.KITE_API_KEY?.trim();
    if (!apiKey) {
      throw new Error('KITE_API_KEY not found in environment variables');
    }
    kiteInstance = new KiteConnect({ api_key: apiKey });
  }
  return kiteInstance;
}

export function setAccessToken(token: string) {
  const kite = getKiteInstance();
  kite.setAccessToken(token);
}

export async function generateSession(requestToken: string) {
  const kite = getKiteInstance();
  const apiSecret = process.env.KITE_API_SECRET?.trim();

  if (!apiSecret) {
    throw new Error('KITE_API_SECRET not found in environment variables');
  }

  const response = await kite.generateSession(requestToken, apiSecret);
  kite.setAccessToken(response.access_token);
  return response;
}

export function getLoginURL() {
  const apiKey = process.env.KITE_API_KEY;
  const redirectUrl =
    process.env.KITE_REDIRECT_URL || 'http://127.0.0.1:3000/callback';

  if (!apiKey) {
    throw new Error('KITE_API_KEY not found in environment variables');
  }

  return `https://kite.zerodha.com/connect/login?api_key=${apiKey}&v=3&redirect_url=${encodeURIComponent(
    redirectUrl
  )}`;
}

// Profile & Account
export async function getProfile(accessToken: string) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  return await kite.getProfile();
}

export async function getMargins(
  accessToken: string,
  segment?: 'equity' | 'commodity'
) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  return await kite.getMargins(segment);
}

// Positions & Holdings
export async function getPositions(accessToken: string) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  return await kite.getPositions();
}

export async function getHoldings(accessToken: string) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  return await kite.getHoldings();
}

// Orders
export async function getOrders(accessToken: string) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  return await kite.getOrders();
}

export async function getOrderHistory(
  accessToken: string,
  orderId: string | number
) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  return await kite.getOrderHistory(orderId);
}

export async function placeOrder(
  accessToken: string,
  variety: string,
  params: any
) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  return await kite.placeOrder(variety, params);
}

export async function modifyOrder(
  accessToken: string,
  variety: string,
  orderId: string,
  params: any
) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  return await kite.modifyOrder(variety, orderId, params);
}

export async function cancelOrder(
  accessToken: string,
  variety: string,
  orderId: string
) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  return await kite.cancelOrder(variety, orderId);
}

// Trades
export async function getTrades(accessToken: string) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  return await kite.getTrades();
}

// Market Data
export async function getQuote(accessToken: string, instruments: string[]) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  return await kite.getQuote(instruments);
}

export async function getOHLC(accessToken: string, instruments: string[]) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  return await kite.getOHLC(instruments);
}

export async function getLTP(accessToken: string, instruments: string[]) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  return await kite.getLTP(instruments);
}

export async function getInstruments(accessToken: string, exchange?: string) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  return await kite.getInstruments(exchange);
}

export async function getHistoricalData(
  accessToken: string,
  instrumentToken: number,
  interval: string,
  from: string | Date,
  to: string | Date,
  continuous: boolean = false,
  oi: boolean = false
) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  return await kite.getHistoricalData(
    instrumentToken,
    interval,
    from,
    to,
    continuous,
    oi
  );
}

// GTT (Good Till Triggered)
export async function getGTTs(accessToken: string) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  return await kite.getGTTs();
}

export async function getGTT(accessToken: string, gttId: number) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  return await kite.getGTT(gttId);
}

export async function placeGTT(accessToken: string, params: any) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  return await kite.placeGTT(params);
}

export async function modifyGTT(
  accessToken: string,
  gttId: number,
  params: any
) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  return await kite.modifyGTT(gttId, params);
}

export async function deleteGTT(accessToken: string, gttId: number) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  return await kite.deleteGTT(gttId);
}

// Mutual Funds
export async function getMFInstruments(accessToken: string) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  // @ts-ignore - SDK method naming may vary
  return await (kite as any).getMFInstruments?.() ?? (kite as any).mfInstruments?.();
}

export async function getMFHoldings(accessToken: string) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  return await (kite as any).getMFHoldings?.() ?? (kite as any).mfHoldings?.();
}

export async function getMFOrders(accessToken: string) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  return await (kite as any).getMFOrders?.() ?? (kite as any).mfOrders?.();
}

export async function placeMFOrder(accessToken: string, params: any) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  return await (kite as any).placeMFOrder?.(params) ?? (kite as any).mfPlaceOrder?.(params);
}

export async function cancelMFOrder(accessToken: string, orderId: string) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  return await (kite as any).cancelMFOrder?.(orderId) ?? (kite as any).mfCancelOrder?.(orderId);
}

export async function getMFSIPs(accessToken: string) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  return await (kite as any).getMFSIPs?.() ?? (kite as any).mfSips?.();
}

export async function placeMFSIP(accessToken: string, params: any) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  return await (kite as any).placeMFSIP?.(params) ?? (kite as any).mfPlaceSip?.(params);
}

export async function modifyMFSIP(accessToken: string, sipId: string, params: any) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  return await (kite as any).modifyMFSIP?.(sipId, params) ?? (kite as any).mfModifySip?.(sipId, params);
}

export async function cancelMFSIP(accessToken: string, sipId: string) {
  const kite = getKiteInstance();
  kite.setAccessToken(accessToken);
  return await (kite as any).cancelMFSIP?.(sipId) ?? (kite as any).mfCancelSip?.(sipId);
}
