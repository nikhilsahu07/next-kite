import { NextRequest, NextResponse } from 'next/server';
import { getMFSIPs, placeMFSIP, modifyMFSIP, cancelMFSIP } from '@/lib/kite-service';

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('kite_access_token')?.value;
  if (!accessToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  try {
    const data = await getMFSIPs(accessToken);
    // Sanitize data to ensure JSON serialization
    const sanitizedData = JSON.parse(JSON.stringify(data, (key, value) => {
      // Convert Date objects to ISO strings
      if (value instanceof Date) {
        return value.toISOString();
      }
      // Remove functions and undefined values
      if (typeof value === 'function' || value === undefined) {
        return null;
      }
      return value;
    }));
    return NextResponse.json(sanitizedData);
  } catch (e) {
    console.error('MF SIPs error:', e);
    return NextResponse.json({ error: 'Failed to fetch MF SIPs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get('kite_access_token')?.value;
  if (!accessToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  try {
    const body = await request.json();
    const data = await placeMFSIP(accessToken, body);
    return NextResponse.json(data);
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Failed to place MF SIP' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const accessToken = request.cookies.get('kite_access_token')?.value;
  if (!accessToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  try {
    const body = await request.json();
    const { sip_id, ...params } = body || {};
    if (!sip_id) return NextResponse.json({ error: 'sip_id required' }, { status: 400 });
    const data = await modifyMFSIP(accessToken, sip_id, params);
    return NextResponse.json(data);
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Failed to modify MF SIP' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const accessToken = request.cookies.get('kite_access_token')?.value;
  if (!accessToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  try {
    const sipId = request.nextUrl.searchParams.get('sip_id') || '';
    if (!sipId) return NextResponse.json({ error: 'sip_id required' }, { status: 400 });
    const data = await cancelMFSIP(accessToken, sipId);
    return NextResponse.json(data);
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Failed to cancel MF SIP' }, { status: 500 });
  }
}


