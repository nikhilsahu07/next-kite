import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('kite_access_token')?.value;
  const envAccessToken = process.env.KITE_ACCESS_TOKEN;
  
  // Allow public access to landing, kite-accounts, manage-account, callback, and other public pages
  const publicPaths = [
    '/landing',
    '/nifty',
    '/',
    '/kite-accounts',
    '/manage-account',
    '/kite-callback',
    '/accounts',
    '/api',
  ];
  
  if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // For protected trading routes (dashboard, positions, holdings, orders)
  if (request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/positions') ||
      request.nextUrl.pathname.startsWith('/holdings') ||
      request.nextUrl.pathname.startsWith('/orders')) {
    
    // Check if user has access token from cookie or env
    // In multi-account mode, tokens are managed per-account in the database
    // Users should access trading through kite-accounts page
    
    // If no cookie token but env token exists (legacy support), set the cookie
    if (!accessToken && envAccessToken) {
      const response = NextResponse.next();
      response.cookies.set('kite_access_token', envAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
      });
      return response;
    }
    
    // If no token at all, redirect to kite-accounts for multi-account selection
    if (!accessToken && !envAccessToken) {
      return NextResponse.redirect(new URL('/kite-accounts', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/positions/:path*', 
    '/holdings/:path*', 
    '/orders/:path*',
    '/kite-accounts/:path*',
    '/manage-account/:path*',
  ],
};

