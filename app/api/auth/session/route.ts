import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('kite_access_token')?.value || '';
    const apiKey = process.env.KITE_API_KEY || '';
    if (!accessToken || !apiKey) {
      return NextResponse.json({ apiKey: '', accessToken: '' }, { status: 200 });
    }
    return NextResponse.json({ apiKey, accessToken });
  } catch (e) {
    return NextResponse.json({ apiKey: '', accessToken: '' }, { status: 200 });
  }
}


