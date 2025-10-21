'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Order } from '@/types/kite';
import { DataGrid } from '@/components/DataGrid';
import type { ColDef } from 'ag-grid-community';
import InstrumentSearch from '@/components/InstrumentSearch';
import { POPULAR_STOCKS } from '@/lib/popular-instruments';

export default function Orders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Define columns before any early returns to keep hook order stable
  const columns: ColDef<Order>[] = useMemo(
    () => [
      {
        headerName: 'Time',
        valueGetter: (p) =>
          new Date(p.data?.order_timestamp ?? '').toLocaleString(),
        width: 170,
      },
      { headerName: 'Symbol', field: 'tradingsymbol', width: 130 },
      { headerName: 'Type', field: 'transaction_type', width: 100 },
      {
        headerName: 'Qty',
        valueGetter: (p) => `${p.data?.filled_quantity}/${p.data?.quantity}`,
        width: 100,
      },
      {
        headerName: 'Price',
        valueGetter: (p) =>
          p.data?.order_type === 'MARKET'
            ? 'MARKET'
            : `₹${Number(p.data?.price ?? 0).toFixed(2)}`,
        width: 110,
      },
      {
        headerName: 'Avg',
        valueGetter: (p) => Number(p.data?.average_price ?? 0).toFixed(2),
        width: 100,
      },
      { headerName: 'Status', field: 'status', width: 120 },
      { headerName: 'Product', field: 'product', width: 110 },
      { headerName: 'Order ID', field: 'order_id', width: 170 },
    ],
    []
  );

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/');
          return;
        }
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load orders');
      setLoading(false);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
            <p className="text-black/60 dark:text-white/60">
              Loading orders...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETE':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
      case 'OPEN':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionColor = (type: string) => {
    return type === 'BUY' ? 'text-green-600' : 'text-red-600';
  };

  // columns declared above

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Orders</h1>
          <div className="flex gap-2">
            <button
              onClick={fetchOrders}
              className="border border-black/10 dark:border-white/20 px-4 py-2 rounded-md"
            >
              Refresh
            </button>
            <a
              href="#place-order"
              className="border border-black/10 dark:border-white/20 px-4 py-2 rounded-md"
            >
              Place Order
            </a>
          </div>
        </div>

        {error && (
          <div className="border border-black/10 dark:border-white/10 rounded-lg p-4 text-red-600 mb-6">
            {error}
          </div>
        )}

        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
          <DataGrid<Order>
            rowData={orders}
            columnDefs={columns}
            hasMore={false}
            height={560}
            getRowId={(row) => row.order_id}
          />
        </div>

        {orders.length > 0 && (
          <div className="grid md:grid-cols-4 gap-6 mt-8">
            <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
              <h3 className="text-sm text-black/60 dark:text-white/60 mb-2">
                Total Orders
              </h3>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>
            <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
              <h3 className="text-sm text-black/60 dark:text-white/60 mb-2">
                Completed
              </h3>
              <p className="text-2xl font-bold">
                {orders.filter((o) => o.status === 'COMPLETE').length}
              </p>
            </div>
            <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
              <h3 className="text-sm text-black/60 dark:text-white/60 mb-2">
                Pending
              </h3>
              <p className="text-2xl font-bold">
                {
                  orders.filter(
                    (o) => o.status === 'OPEN' || o.status === 'PENDING'
                  ).length
                }
              </p>
            </div>
            <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
              <h3 className="text-sm text-black/60 dark:text-white/60 mb-2">
                Rejected/Cancelled
              </h3>
              <p className="text-2xl font-bold">
                {
                  orders.filter(
                    (o) => o.status === 'REJECTED' || o.status === 'CANCELLED'
                  ).length
                }
              </p>
            </div>
          </div>
        )}
        {/* Place/Modify/Cancel Orders */}
        <div
          id="place-order"
          className="rounded-lg border border-black/10 dark:border-white/10 p-6 mt-8"
        >
          <h2 className="text-xl font-semibold mb-4">Order Operations</h2>
          <OrderOperations onCompleted={fetchOrders} />
        </div>
      </div>
    </div>
  );
}

function OrderOperations({ onCompleted }: { onCompleted: () => void }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [symbol, setSymbol] = useState('NSE:RELIANCE');
  const [qty, setQty] = useState(1);
  const [transactionType, setTransactionType] = useState<'BUY' | 'SELL'>('BUY');
  const [product, setProduct] = useState<'CNC' | 'MIS' | 'NRML'>('MIS');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [price, setPrice] = useState<number | ''>('');
  const [variety, setVariety] = useState<'regular' | 'amo'>('regular');

  const [modifyOrderId, setModifyOrderId] = useState('');
  const [cancelOrderId, setCancelOrderId] = useState('');

  const place = async () => {
    setLoading(true);
    setMessage('');
    try {
      const payload: any = {
        exchange: symbol.split(':')[0],
        tradingsymbol: symbol.split(':')[1],
        transaction_type: transactionType,
        quantity: qty,
        product,
        order_type: orderType,
      };
      if (orderType === 'LIMIT' && price) payload.price = Number(price);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variety, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to place order');
      setMessage(`Placed: ${JSON.stringify(data)}`);
      onCompleted();
    } catch (e: any) {
      setMessage(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const modify = async () => {
    setLoading(true);
    setMessage('');
    try {
      if (!modifyOrderId) throw new Error('Order ID required');
      const payload: any = {};
      if (qty) payload.quantity = qty;
      if (orderType) payload.order_type = orderType;
      if (orderType === 'LIMIT' && price) payload.price = Number(price);
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variety, order_id: modifyOrderId, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to modify order');
      setMessage(`Modified: ${JSON.stringify(data)}`);
      onCompleted();
    } catch (e: any) {
      setMessage(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const cancel = async () => {
    setLoading(true);
    setMessage('');
    try {
      if (!cancelOrderId) throw new Error('Order ID required');
      const params = new URLSearchParams({ order_id: cancelOrderId, variety });
      const res = await fetch(`/api/orders?${params.toString()}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to cancel order');
      setMessage(`Cancelled: ${JSON.stringify(data)}`);
      onCompleted();
    } catch (e: any) {
      setMessage(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="border border-black/10 dark:border-white/10 rounded p-3 text-sm">
          {message}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <InstrumentSearch
            label="Symbol"
            exchange="NSE"
            value={symbol}
            onChange={(val) => setSymbol(val)}
          />
          <div className="flex flex-wrap gap-2">
            {POPULAR_STOCKS.slice(0, 8).map((p) => (
              <button
                key={p.value}
                onClick={() => setSymbol(`${p.exchange}:${p.value}`)}
                className={`px-3 py-1 rounded border text-xs ${symbol === `${p.exchange}:${p.value}` ? 'bg-blue-600 text-white border-blue-600' : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs text-black/60 dark:text-white/60 mb-1">
            Quantity
          </label>
          <input
            className="w-full border px-3 py-2 bg-transparent"
            type="number"
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value || '0'))}
          />
        </div>
        <div>
          <label className="block text-xs text-black/60 dark:text-white/60 mb-1">
            Variety
          </label>
          <select
            className="w-full border px-3 py-2 bg-transparent"
            value={variety}
            onChange={(e) => setVariety(e.target.value as any)}
          >
            <option value="regular">regular</option>
            <option value="amo">amo</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-black/60 dark:text-white/60 mb-1">
            Side
          </label>
          <select
            className="w-full border px-3 py-2 bg-transparent"
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value as any)}
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-black/60 dark:text-white/60 mb-1">
            Product
          </label>
          <select
            className="w-full border px-3 py-2 bg-transparent"
            value={product}
            onChange={(e) => setProduct(e.target.value as any)}
          >
            <option value="MIS">MIS</option>
            <option value="CNC">CNC</option>
            <option value="NRML">NRML</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-black/60 dark:text-white/60 mb-1">
            Order Type
          </label>
          <select
            className="w-full border px-3 py-2 bg-transparent"
            value={orderType}
            onChange={(e) => setOrderType(e.target.value as any)}
          >
            <option value="MARKET">MARKET</option>
            <option value="LIMIT">LIMIT</option>
          </select>
        </div>
        {orderType === 'LIMIT' && (
          <div>
            <label className="block text-xs text-black/60 dark:text-white/60 mb-1">
              Price
            </label>
            <input
              className="w-full border px-3 py-2 bg-transparent"
              type="number"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value ? Number(e.target.value) : '')
              }
            />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          disabled={loading}
          onClick={place}
          className="border border-black/10 dark:border-white/20 px-4 py-2 rounded-md"
        >
          {loading ? 'Placing...' : 'Place Order'}
        </button>
        <button
          disabled={loading}
          onClick={modify}
          className="border border-black/10 dark:border-white/20 px-4 py-2 rounded-md"
        >
          {loading ? 'Modifying...' : 'Modify Order'}
        </button>
        <button
          disabled={loading}
          onClick={cancel}
          className="border border-black/10 dark:border-white/20 px-4 py-2 rounded-md"
        >
          {loading ? 'Cancelling...' : 'Cancel Order'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-black/60 dark:text-white/60 mb-1">
            Modify Order ID
          </label>
          <input
            className="w-full border px-3 py-2 bg-transparent"
            value={modifyOrderId}
            onChange={(e) => setModifyOrderId(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-black/60 dark:text-white/60 mb-1">
            Cancel Order ID
          </label>
          <input
            className="w-full border px-3 py-2 bg-transparent"
            value={cancelOrderId}
            onChange={(e) => setCancelOrderId(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
