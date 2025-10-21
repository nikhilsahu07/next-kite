import { NextRequest, NextResponse } from 'next/server';
import {
  getOrders,
  placeOrder,
  modifyOrder,
  cancelOrder,
} from '@/lib/kite-service';

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('kite_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const orders = await getOrders(accessToken);
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get('kite_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { variety, ...orderParams } = body;
    const order = await placeOrder(
      accessToken,
      variety || 'regular',
      orderParams
    );
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error placing order:', error);
    return NextResponse.json(
      { error: 'Failed to place order' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const accessToken = request.cookies.get('kite_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { variety = 'regular', order_id, ...params } = body;
    if (!order_id) {
      return NextResponse.json({ error: 'order_id required' }, { status: 400 });
    }
    const resp = await modifyOrder(
      accessToken,
      variety,
      String(order_id),
      params
    );
    return NextResponse.json(resp);
  } catch (error) {
    console.error('Error modifying order:', error);
    return NextResponse.json(
      { error: 'Failed to modify order' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const accessToken = request.cookies.get('kite_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const order_id = searchParams.get('order_id');
    const variety = searchParams.get('variety') || 'regular';
    if (!order_id) {
      return NextResponse.json({ error: 'order_id required' }, { status: 400 });
    }
    const resp = await cancelOrder(accessToken, variety, order_id);
    return NextResponse.json(resp);
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
