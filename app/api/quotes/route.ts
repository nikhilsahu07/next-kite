import { NextRequest, NextResponse } from 'next/server';
import { getQuote, getLTP, getOHLC } from '@/lib/kite-service';

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('kite_access_token')?.value;
  const searchParams = request.nextUrl.searchParams;
  const instruments = searchParams.get('instruments')?.split(',') || [];
  const type = searchParams.get('type') || 'quote'; // quote, ltp, ohlc

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (instruments.length === 0) {
    return NextResponse.json(
      { error: 'No instruments provided' },
      { status: 400 }
    );
  }

  try {
    let data;
    // Updated to match new function signatures: instruments first, accessToken last
    switch (type) {
      case 'ltp':
        data = await getLTP(instruments, accessToken);
        break;
      case 'ohlc':
        data = await getOHLC(instruments, accessToken);
        break;
      default:
        data = await getQuote(instruments, accessToken);
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}

