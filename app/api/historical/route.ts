import { NextRequest, NextResponse } from 'next/server';
import { getHistoricalData } from '@/lib/kite-service';

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('kite_access_token')?.value;
  if (!accessToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const sp = request.nextUrl.searchParams;
  const token = Number(sp.get('instrument_token') || '');
  const interval = sp.get('interval') || 'day';
  const from = sp.get('from') || '';
  const to = sp.get('to') || '';
  const continuous = sp.get('continuous') === 'true';
  const oi = sp.get('oi') === 'true';

  if (!token || !from || !to) {
    return NextResponse.json({ error: 'instrument_token, from, to required' }, { status: 400 });
  }

  try {
    // Updated to match new function signature: instrumentToken, interval, from, to, continuous, oi, accessToken
    const data = await getHistoricalData(token, interval, from, to, continuous, oi, accessToken);
    return NextResponse.json(data);
  } catch (e:any) {
    console.error('Historical error:', e);
    return NextResponse.json({ error: e?.message || 'Failed to fetch historical data' }, { status: 500 });
  }
}


