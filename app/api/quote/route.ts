import { NextRequest, NextResponse } from 'next/server';
import { getQuote } from '@/lib/kite-service';

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get('kite_access_token')?.value;
  const authHeader = request.headers.get('authorization');
  
  // Extract token from Authorization header if provided
  const token = authHeader?.replace('Bearer ', '') || accessToken;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { instruments } = body;

    if (!instruments || !Array.isArray(instruments)) {
      return NextResponse.json({ error: 'Instruments array is required' }, { status: 400 });
    }

    // Convert instrument tokens to instrument keys (exchange:token format)
    const instrumentKeys = instruments.map((instrumentToken: number) => {
      // For now, assuming NSE exchange - in production, you'd want to store exchange info
      return `NSE:${instrumentToken}`;
    });

    // Updated to match new function signature: getQuote(instruments, accessToken)
    const quoteData = await getQuote(instrumentKeys, token);
    return NextResponse.json(quoteData);
  } catch (error) {
    console.error('Error fetching quote data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote data' },
      { status: 500 }
    );
  }
}
