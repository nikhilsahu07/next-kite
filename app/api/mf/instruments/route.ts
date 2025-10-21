import { NextRequest, NextResponse } from 'next/server';
import { getMFInstruments } from '@/lib/kite-service';

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('kite_access_token')?.value;
  if (!accessToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  try {
    const data = await getMFInstruments(accessToken);
    return NextResponse.json(data);
  } catch (e) {
    console.error('MF instruments error:', e);
    return NextResponse.json({ error: 'Failed to fetch MF instruments' }, { status: 500 });
  }
}


