import { NextRequest, NextResponse } from 'next/server';
import { KiteConnect } from 'kiteconnect';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestToken, apiKey, apiSecret } = body;

    if (!requestToken || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Create a new KiteConnect instance with the account's API key
    const kite = new KiteConnect({ api_key: apiKey });
    
    // Generate session using the request token and API secret
    const session = await kite.generateSession(requestToken, apiSecret);
    
    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    console.error('Error generating session:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to generate session',
        details: error.response?.data || error.toString()
      },
      { status: 500 }
    );
  }
}

