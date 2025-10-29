import { KiteConnect } from 'kiteconnect';

// Dynamic credentials from database (no more env dependency)
let currentCredentials: any | null = null;
let kiteInstance: any | null = null;

/**
 * Fetch credentials from the selected account in database
 * Only works in client-side (browser) context
 */
export async function getCredentials() {
  // Check if we're in browser context
  if (typeof window === 'undefined') {
    throw new Error('getCredentials() can only be called from browser context. Use accessToken directly in API routes.');
  }

  // Try to fetch from API endpoint
  try {
    const response = await fetch('/api/kite-auth/get-credentials');
    const data = await response.json();
    
    if (data.success) {
      currentCredentials = data.credentials;
      return currentCredentials;
    } else {
      throw new Error(data.message || 'Failed to get credentials');
    }
  } catch (error) {
    console.error('Error fetching credentials:', error);
    throw new Error('No account selected. Please select an account from the Kite Accounts page.');
  }
}

export async function getKiteInstance(accessToken?: string, apiKey?: string): Promise<any> {
  // If accessToken provided (server-side API routes), use it directly
  if (accessToken && apiKey) {
    // Create instance with provided credentials (server-side usage)
    if (!kiteInstance || kiteInstance.api_key !== apiKey) {
      kiteInstance = new KiteConnect({ api_key: apiKey });
    }
    kiteInstance.setAccessToken(accessToken);
    return kiteInstance;
  }

  // Otherwise fetch from database (client-side usage)
  if (!currentCredentials) {
    await getCredentials();
  }

  if (!currentCredentials) {
    throw new Error('No credentials available. Please select an account.');
  }

  // Create new instance if needed or API key changed
  if (!kiteInstance || kiteInstance.api_key !== currentCredentials.apiKey) {
    kiteInstance = new KiteConnect({ api_key: currentCredentials.apiKey });
  }

  // Set access token
  if (currentCredentials.accessToken) {
    kiteInstance.setAccessToken(currentCredentials.accessToken);
  }

  return kiteInstance;
}

export function setAccessToken(token: string) {
  if (kiteInstance) {
    kiteInstance.setAccessToken(token);
  }
}

export async function generateSession(requestToken: string, apiKey: string, apiSecret: string) {
  const kite = new KiteConnect({ api_key: apiKey });
  const response = await kite.generateSession(requestToken, apiSecret);
  kite.setAccessToken(response.access_token);
  return response;
}

export async function getLoginURL() {
  const credentials = await getCredentials();
  const redirectUrl = credentials.redirectUrl || 'http://localhost:3000/kite-callback';
  return `https://kite.zerodha.com/connect/login?api_key=${credentials.apiKey}&v=3&redirect_url=${encodeURIComponent(redirectUrl)}`;
}

// Profile & Account
export async function getProfile(accessToken?: string, apiKey?: string) {
  const kite = await getKiteInstance(accessToken, apiKey);
  return await kite.getProfile();
}

export async function getMargins(
  accessToken?: string,
  segment?: 'equity' | 'commodity',
  apiKey?: string
) {
  const kite = await getKiteInstance(accessToken, apiKey);
  return await kite.getMargins(segment);
}

// Positions & Holdings
export async function getPositions(accessToken?: string, apiKey?: string) {
  const kite = await getKiteInstance(accessToken, apiKey);
  return await kite.getPositions();
}

export async function getHoldings(accessToken?: string, apiKey?: string) {
  const kite = await getKiteInstance(accessToken, apiKey);
  return await kite.getHoldings();
}

// Orders
export async function getOrders(accessToken?: string, apiKey?: string) {
  const kite = await getKiteInstance(accessToken, apiKey);
  return await kite.getOrders();
}

export async function getOrderHistory(
  orderId: string | number,
  accessToken?: string,
  apiKey?: string
) {
  const kite = await getKiteInstance(accessToken, apiKey);
  return await kite.getOrderHistory(orderId);
}

export async function placeOrder(
  variety: string,
  params: any,
  accessToken?: string,
  apiKey?: string
) {
  const kite = await getKiteInstance(accessToken, apiKey);
  return await kite.placeOrder(variety, params);
}

export async function modifyOrder(
  variety: string,
  orderId: string,
  params: any,
  accessToken?: string,
  apiKey?: string
) {
  const kite = await getKiteInstance(accessToken, apiKey);
  return await kite.modifyOrder(variety, orderId, params);
}

export async function cancelOrder(
  variety: string,
  orderId: string,
  accessToken?: string,
  apiKey?: string
) {
  const kite = await getKiteInstance(accessToken, apiKey);
  return await kite.cancelOrder(variety, orderId);
}

// Trades
export async function getTrades(accessToken?: string) {
  const kite = await getKiteInstance();
  if (accessToken) {
    kite.setAccessToken(accessToken);
  }
  return await kite.getTrades();
}

// Market Data
export async function getQuote(instruments: string[], accessToken?: string) {
  const kite = await getKiteInstance();
  if (accessToken) {
    kite.setAccessToken(accessToken);
  }
  return await kite.getQuote(instruments);
}

export async function getOHLC(instruments: string[], accessToken?: string) {
  const kite = await getKiteInstance();
  if (accessToken) {
    kite.setAccessToken(accessToken);
  }
  return await kite.getOHLC(instruments);
}

export async function getLTP(instruments: string[], accessToken?: string) {
  const kite = await getKiteInstance();
  if (accessToken) {
    kite.setAccessToken(accessToken);
  }
  return await kite.getLTP(instruments);
}

export async function getInstruments(exchange?: string, accessToken?: string, apiKey?: string) {
  const kite = await getKiteInstance(accessToken, apiKey);
  return await kite.getInstruments(exchange);
}

export async function getHistoricalData(
  instrumentToken: number,
  interval: string,
  from: string | Date,
  to: string | Date,
  continuous: boolean = false,
  oi: boolean = false,
  accessToken?: string
) {
  const kite = await getKiteInstance();
  if (accessToken) {
    kite.setAccessToken(accessToken);
  }
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
export async function getGTTs(accessToken?: string) {
  const kite = await getKiteInstance();
  if (accessToken) {
    kite.setAccessToken(accessToken);
  }
  return await kite.getGTTs();
}

export async function getGTT(gttId: number, accessToken?: string) {
  const kite = await getKiteInstance();
  if (accessToken) {
    kite.setAccessToken(accessToken);
  }
  return await kite.getGTT(gttId);
}

export async function placeGTT(params: any, accessToken?: string) {
  const kite = await getKiteInstance();
  if (accessToken) {
    kite.setAccessToken(accessToken);
  }
  return await kite.placeGTT(params);
}

export async function modifyGTT(
  gttId: number,
  params: any,
  accessToken?: string
) {
  const kite = await getKiteInstance();
  if (accessToken) {
    kite.setAccessToken(accessToken);
  }
  return await kite.modifyGTT(gttId, params);
}

export async function deleteGTT(gttId: number, accessToken?: string) {
  const kite = await getKiteInstance();
  if (accessToken) {
    kite.setAccessToken(accessToken);
  }
  return await kite.deleteGTT(gttId);
}

// Mutual Funds
export async function getMFInstruments(accessToken?: string) {
  const kite = await getKiteInstance();
  if (accessToken) {
    kite.setAccessToken(accessToken);
  }
  // @ts-ignore - SDK method naming may vary
  return await (kite as any).getMFInstruments?.() ?? (kite as any).mfInstruments?.();
}

export async function getMFHoldings(accessToken?: string) {
  const kite = await getKiteInstance();
  if (accessToken) {
    kite.setAccessToken(accessToken);
  }
  return await (kite as any).getMFHoldings?.() ?? (kite as any).mfHoldings?.();
}

export async function getMFOrders(accessToken?: string) {
  const kite = await getKiteInstance();
  if (accessToken) {
    kite.setAccessToken(accessToken);
  }
  return await (kite as any).getMFOrders?.() ?? (kite as any).mfOrders?.();
}

export async function placeMFOrder(params: any, accessToken?: string) {
  const kite = await getKiteInstance();
  if (accessToken) {
    kite.setAccessToken(accessToken);
  }
  return await (kite as any).placeMFOrder?.(params) ?? (kite as any).mfPlaceOrder?.(params);
}

export async function cancelMFOrder(orderId: string, accessToken?: string) {
  const kite = await getKiteInstance();
  if (accessToken) {
    kite.setAccessToken(accessToken);
  }
  return await (kite as any).cancelMFOrder?.(orderId) ?? (kite as any).mfCancelOrder?.(orderId);
}

export async function getMFSIPs(accessToken?: string) {
  const kite = await getKiteInstance();
  if (accessToken) {
    kite.setAccessToken(accessToken);
  }
  return await (kite as any).getMFSIPs?.() ?? (kite as any).mfSips?.();
}

export async function placeMFSIP(params: any, accessToken?: string) {
  const kite = await getKiteInstance();
  if (accessToken) {
    kite.setAccessToken(accessToken);
  }
  return await (kite as any).placeMFSIP?.(params) ?? (kite as any).mfPlaceSip?.(params);
}

export async function modifyMFSIP(sipId: string, params: any, accessToken?: string) {
  const kite = await getKiteInstance();
  if (accessToken) {
    kite.setAccessToken(accessToken);
  }
  return await (kite as any).modifyMFSIP?.(sipId, params) ?? (kite as any).mfModifySip?.(sipId, params);
}

export async function cancelMFSIP(sipId: string, accessToken?: string) {
  const kite = await getKiteInstance();
  if (accessToken) {
    kite.setAccessToken(accessToken);
  }
  return await (kite as any).cancelMFSIP?.(sipId) ?? (kite as any).mfCancelSip?.(sipId);
}
