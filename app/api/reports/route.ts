import { NextRequest, NextResponse } from 'next/server';
import { getOrders, getTrades, getPositions } from '@/lib/kite-service';

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('kite_access_token')?.value;
  if (!accessToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  try {
    const [orders, trades, positions] = await Promise.all([
      getOrders(accessToken),
      getTrades(accessToken),
      getPositions(accessToken),
    ]);

    const summary = {
      totals: {
        orders: orders?.length || 0,
        trades: trades?.length || 0,
        openPositions: (positions?.net || []).length || 0,
      },
      byStatus: orders?.reduce((acc: Record<string, number>, o: any) => {
        const k = (o.status || 'UNKNOWN').toUpperCase();
        acc[k] = (acc[k] || 0) + 1;
        return acc;
      }, {}) || {},
    };

    return NextResponse.json({ summary, orders, trades, positions });
  } catch (e:any) {
    console.error('Reports error:', e);
    return NextResponse.json({ error: e?.message || 'Failed to fetch reports' }, { status: 500 });
  }
}


