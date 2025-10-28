import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('kite_access_token')?.value;
  const envAccessToken = process.env.KITE_ACCESS_TOKEN;
  
  // Allow public access to landing and Nifty chart pages
  if (request.nextUrl.pathname.startsWith('/landing') ||
      request.nextUrl.pathname.startsWith('/nifty') ||
      request.nextUrl.pathname === '/') {
    return NextResponse.next();
  }
  
  // If accessing protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/positions') ||
      request.nextUrl.pathname.startsWith('/holdings') ||
      request.nextUrl.pathname.startsWith('/orders')) {
    
    // If no cookie token but env token exists, set the cookie
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
    
    // If no token at all, redirect to home
    if (!accessToken && !envAccessToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/positions/:path*', '/holdings/:path*', '/orders/:path*'],
};

