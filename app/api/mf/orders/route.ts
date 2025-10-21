import { NextRequest, NextResponse } from 'next/server';
import { getMFOrders, placeMFOrder, cancelMFOrder } from '@/lib/kite-service';

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('kite_access_token')?.value;
  if (!accessToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  try {
    const data = await getMFOrders(accessToken);
    return NextResponse.json(data);
  } catch (e) {
    console.error('MF orders error:', e);
    return NextResponse.json({ error: 'Failed to fetch MF orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get('kite_access_token')?.value;
  if (!accessToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  try {
    const body = await request.json();
    const data = await placeMFOrder(accessToken, body);
    return NextResponse.json(data);
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Failed to place MF order' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const accessToken = request.cookies.get('kite_access_token')?.value;
  if (!accessToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  try {
    const orderId = request.nextUrl.searchParams.get('order_id') || '';
    if (!orderId) return NextResponse.json({ error: 'order_id required' }, { status: 400 });
    const data = await cancelMFOrder(accessToken, orderId);
    return NextResponse.json(data);
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Failed to cancel MF order' }, { status: 500 });
  }
}


