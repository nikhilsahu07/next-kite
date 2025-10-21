import { NextRequest, NextResponse } from 'next/server';
import { generateSession } from '@/lib/kite-service';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const requestToken = searchParams.get('request_token');
  const status = searchParams.get('status');

  if (status === 'error' || !requestToken) {
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
  }

  try {
    const session = await generateSession(requestToken);
    
    // In a production app, you should store this securely (e.g., in a session cookie or database)
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    response.cookies.set('kite_access_token', session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });
    
    return response;
  } catch (error) {
    console.error('Error generating session:', error);
    return NextResponse.redirect(new URL('/?error=session_failed', request.url));
  }
}

