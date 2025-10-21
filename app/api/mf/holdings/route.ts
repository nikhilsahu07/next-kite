import { NextRequest, NextResponse } from 'next/server';
import { getMFHoldings } from '@/lib/kite-service';

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('kite_access_token')?.value;
  if (!accessToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  try {
    const data = await getMFHoldings(accessToken);
    return NextResponse.json(data);
  } catch (e) {
    console.error('MF holdings error:', e);
    return NextResponse.json({ error: 'Failed to fetch MF holdings' }, { status: 500 });
  }
}


