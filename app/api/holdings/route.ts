import { NextRequest, NextResponse } from 'next/server';
import { getHoldings } from '@/lib/kite-service';

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('kite_access_token')?.value;
  const apiKey = request.cookies.get('kite_api_key')?.value;

  if (!accessToken || !apiKey) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const holdings = await getHoldings(accessToken, apiKey);
    return NextResponse.json(holdings);
  } catch (error) {
    console.error('Error fetching holdings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch holdings' },
      { status: 500 }
    );
  }
}

