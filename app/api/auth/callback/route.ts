import { NextRequest, NextResponse } from 'next/server';

/**
 * Legacy Auth Callback Route
 * 
 * This route is no longer used in the new multi-account system.
 * The new system uses /kite-callback (client-side) which handles callbacks
 * in the browser and communicates with the parent window.
 * 
 * This route is kept for backward compatibility but redirects to kite-accounts.
 */

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const requestToken = searchParams.get('request_token');
  const status = searchParams.get('status');

  console.warn('⚠️ Legacy callback route called. Use /kite-callback instead.');

  if (status === 'error' || !requestToken) {
    return NextResponse.redirect(new URL('/kite-accounts?error=auth_failed', request.url));
  }

  // Redirect to kite-accounts page with instructions
  return NextResponse.redirect(
    new URL(
      '/kite-accounts?message=Please use the "Get Access Token" button to authenticate',
      request.url
    )
  );
}

