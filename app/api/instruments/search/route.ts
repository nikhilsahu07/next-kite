import { NextRequest, NextResponse } from 'next/server';
import { getInstruments } from '@/lib/kite-service';

// Simple in-memory cache for instruments during dev session
let cachedInstruments: any[] | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('kite_access_token')?.value;
  const apiKey = request.cookies.get('kite_api_key')?.value;
  const searchParams = request.nextUrl.searchParams;
  const q = (searchParams.get('q') || '').trim().toUpperCase();
  const exchange = (searchParams.get('exchange') || '').toUpperCase(); // e.g., NSE, BSE, NFO, CDS
  const limit = Number(searchParams.get('limit') || '15');

  if (!accessToken || !apiKey) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const now = Date.now();
    if (!cachedInstruments || now - cachedAt > CACHE_TTL_MS) {
      // Fetch all instruments (optionally by exchange)
      // Kite API supports per-exchange fetch; if none provided, fetch NSE by default then extend
      const exchangesToFetch = exchange ? [exchange] : ['NSE', 'BSE'];
      const all: any[] = [];
      for (const ex of exchangesToFetch) {
        try {
          const list = await getInstruments(ex, accessToken, apiKey);
          if (Array.isArray(list)) all.push(...list);
        } catch (e) {
          // ignore per-exchange errors to still return what we have
          // eslint-disable-next-line no-console
          console.warn('Failed to fetch instruments for', ex);
        }
      }
      cachedInstruments = all;
      cachedAt = now;
    }

    let results = (cachedInstruments || []);
    if (exchange) {
      results = results.filter((i: any) => (i.exchange || '').toUpperCase() === exchange);
    }
    if (q) {
      results = results.filter((i: any) => {
        const sym = String(i.tradingsymbol || '').toUpperCase();
        const name = String(i.name || '').toUpperCase();
        const exch = String(i.exchange || '').toUpperCase();
        return sym.includes(q) || name.includes(q) || `${exch}:${sym}`.includes(q);
      });
    }

    // Map down to lighter payload
    const mapped = results.slice(0, Math.max(1, Math.min(50, limit))).map((i: any) => ({
      instrument_token: i.instrument_token,
      tradingsymbol: i.tradingsymbol,
      exchange: i.exchange,
      name: i.name,
      segment: i.segment,
      tick_size: i.tick_size,
      lot_size: i.lot_size,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Instrument search failed:', error);
    return NextResponse.json({ error: 'Failed to search instruments' }, { status: 500 });
  }
}


