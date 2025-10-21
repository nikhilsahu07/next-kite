import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get('kite_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const orders = await request.json();
    const apiKey = process.env.KITE_API_KEY;

    const response = await fetch('https://api.kite.trade/charges/orders', {
      method: 'POST',
      headers: {
        'X-Kite-Version': '3',
        'Authorization': `token ${apiKey}:${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orders),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error calculating charges:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to calculate charges' },
      { status: 500 }
    );
  }
}

