import { NextRequest, NextResponse } from 'next/server';
import { KiteConnect } from 'kiteconnect';

/**
 * Auto Session Generation API
 * 
 * This endpoint helps with automatic session generation by:
 * 1. Providing the login URL for an account
 * 2. Checking if we can auto-generate a session (if request token available)
 * 
 * Note: Zerodha requires user interaction (login + TOTP) for security,
 * so full automation isn't possible. This endpoint facilitates the process.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, accountId, apiKey, apiSecret, requestToken } = body;

    if (action === 'get_login_url') {
      // Generate login URL for the account
      if (!apiKey) {
        return NextResponse.json(
          { error: 'API Key is required' },
          { status: 400 }
        );
      }

      const loginUrl = `https://kite.zerodha.com/connect/login?api_key=${apiKey}&v=3`;
      
      return NextResponse.json({
        success: true,
        loginUrl,
        message: 'Login URL generated. User must login manually.',
        accountId,
      });
    }

    if (action === 'generate_session') {
      // Generate session from request token
      if (!apiKey || !apiSecret || !requestToken) {
        return NextResponse.json(
          { error: 'API Key, API Secret, and Request Token are required' },
          { status: 400 }
        );
      }

      const kite = new KiteConnect({ api_key: apiKey });
      const session = await kite.generateSession(requestToken, apiSecret);

      return NextResponse.json({
        success: true,
        session,
        accountId,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "get_login_url" or "generate_session"' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error in auto-session:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process auto-session request',
        details: error.response?.data || error.toString()
      },
      { status: 500 }
    );
  }
}

