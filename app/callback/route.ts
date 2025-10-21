import { NextRequest, NextResponse } from 'next/server';
import { generateSession } from '@/lib/kite-service';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const requestToken = searchParams.get('request_token');
  const status = searchParams.get('status');

  console.log('Callback received:', { requestToken, status });

  if (status === 'error' || !requestToken) {
    console.error('Authentication failed:', { status, requestToken });
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
  }

  try {
    console.log('Generating session with request token:', requestToken);
    const session = await generateSession(requestToken);
    
    console.log('Session generated successfully:', {
      user_id: session.user_id,
      user_name: session.user_name,
      email: session.email
    });

    // Redirect to dashboard with success
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    
    // Set the access token in a cookie
    response.cookies.set('kite_access_token', session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    // Also set user info in cookies for easy access
    response.cookies.set('kite_user_id', session.user_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    response.cookies.set('kite_user_name', session.user_name, {
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
