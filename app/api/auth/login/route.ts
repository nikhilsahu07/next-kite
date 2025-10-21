import { NextResponse } from 'next/server';
import { getLoginURL } from '@/lib/kite-service';

export async function GET() {
  try {
    const loginUrl = getLoginURL();
    return NextResponse.json({ url: loginUrl });
  } catch (error) {
    console.error('Error generating login URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate login URL' },
      { status: 500 }
    );
  }
}

