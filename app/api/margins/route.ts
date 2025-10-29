import { NextRequest, NextResponse } from 'next/server';
import { getMargins } from '@/lib/kite-service';

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('kite_access_token')?.value;
  const apiKey = request.cookies.get('kite_api_key')?.value;
  const searchParams = request.nextUrl.searchParams;
  const segment = searchParams.get('segment') as 'equity' | 'commodity' | null;

  if (!accessToken || !apiKey) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const margins = await getMargins(accessToken, segment || undefined, apiKey);
    return NextResponse.json(margins);
  } catch (error) {
    console.error('Error fetching margins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch margins' },
      { status: 500 }
    );
  }
}

