import { NextRequest, NextResponse } from 'next/server';

/**
 * Legacy Callback Route
 * 
 * This route is no longer used in the new multi-account system.
 * The new system uses /kite-callback (client-side page) which handles callbacks
 * in the browser and communicates with the parent window for per-account authentication.
 * 
 * This route is kept for backward compatibility but redirects to kite-accounts.
 */

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const requestToken = searchParams.get('request_token');
  const status = searchParams.get('status');

  console.warn('⚠️ Legacy /callback route called. Use /kite-callback instead.');
  console.log('Callback received:', { requestToken, status });

  if (status === 'error' || !requestToken) {
    console.error('Authentication failed:', { status, requestToken });
    return NextResponse.redirect(new URL('/kite-accounts?error=auth_failed', request.url));
  }

  // Redirect to kite-accounts page with instructions
  return NextResponse.redirect(
    new URL(
      '/kite-accounts?message=Please use the "Get Access Token" button to authenticate your accounts',
      request.url
    )
  );
}
