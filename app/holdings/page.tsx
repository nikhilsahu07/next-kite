'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { Holding } from '@/types/kite';
import { DataGrid } from '@/components/DataGrid';
import type { ColDef } from 'ag-grid-community';

export default function Holdings() {
  const router = useRouter();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(50); // client-side infinite scroll window

  // Define columns before any early returns to keep hook order stable
  const columns: ColDef<Holding>[] = useMemo(
    () => [
      { headerName: 'Symbol', field: 'tradingsymbol', width: 140 },
      { headerName: 'Exchange', field: 'exchange', width: 100 },
      { headerName: 'Qty', field: 'quantity', width: 90 },
      {
        headerName: 'Avg Price',
        valueGetter: (p) =>
          p.data ? `₹${p.data.average_price.toFixed(2)}` : '',
        width: 110,
      },
      {
        headerName: 'LTP',
        valueGetter: (p) => (p.data ? `₹${p.data.last_price.toFixed(2)}` : ''),
        width: 100,
      },
      {
        headerName: 'Current Value',
        valueGetter: (p) =>
          p.data ? `₹${(p.data.last_price * p.data.quantity).toFixed(2)}` : '',
        width: 140,
      },
      {
        headerName: 'P&L',
        valueGetter: (p) =>
          p.data
            ? `${p.data.pnl >= 0 ? '+' : ''}₹${p.data.pnl.toFixed(2)}`
            : '',
        width: 120,
      },
      {
        headerName: 'Day Change',
        valueGetter: (p) =>
          p.data
            ? `${p.data.day_change >= 0 ? '+' : ''}₹${p.data.day_change.toFixed(
                2
              )} (${p.data.day_change_percentage.toFixed(2)}%)`
            : '',
        width: 170,
      },
    ],
    []
  );

  useEffect(() => {
    fetchHoldings();
  }, []);

  const fetchHoldings = async () => {
    try {
      const response = await fetch('/api/holdings');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/');
          return;
        }
        throw new Error('Failed to fetch holdings');
      }
      const data = await response.json();
      setHoldings(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load holdings');
      setLoading(false);
      console.error(err);
    }
  };

  const onLoadMore = () => {
    if (visibleCount < holdings.length) {
      setVisibleCount((c) => Math.min(c + 50, holdings.length));
    }
  };

  const hasMore = visibleCount < holdings.length;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading holdings...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const calculateTotalValue = () => {
    return holdings.reduce(
      (sum, holding) => sum + holding.last_price * holding.quantity,
      0
    );
  };

  const calculateTotalPnL = () => {
    return holdings.reduce((sum, holding) => sum + holding.pnl, 0);
  };

  const calculateTotalInvestment = () => {
    return holdings.reduce(
      (sum, holding) => sum + holding.average_price * holding.quantity,
      0
    );
  };

  // columns defined above to keep hooks order stable across renders

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Holdings</h1>

        {error && (
          <div className="border border-black/10 dark:border-white/10 rounded-lg p-4 text-red-600 mb-6">
            {error}
          </div>
        )}

        {holdings.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
              <h3 className="text-sm text-black/60 dark:text-white/60 mb-2">
                Total Investment
              </h3>
              <p className="text-2xl font-bold">
                ₹
                {calculateTotalInvestment().toLocaleString('en-IN', {
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
              <h3 className="text-sm text-black/60 dark:text-white/60 mb-2">
                Current Value
              </h3>
              <p className="text-2xl font-bold">
                ₹
                {calculateTotalValue().toLocaleString('en-IN', {
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
              <h3 className="text-sm text-black/60 dark:text-white/60 mb-2">
                Total P&L
              </h3>
              <p
                className={`text-2xl font-bold ${
                  calculateTotalPnL() >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {calculateTotalPnL() >= 0 ? '+' : ''}₹
                {calculateTotalPnL().toLocaleString('en-IN', {
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
          {holdings.length === 0 ? (
            <div className="text-center py-8 text-black/60 dark:text-white/60">
              No holdings found
            </div>
          ) : (
            <DataGrid<Holding>
              rowData={holdings.slice(0, visibleCount)}
              columnDefs={columns}
              hasMore={hasMore}
              onLoadMore={onLoadMore}
              height={560}
              getRowId={(r) => `${r.tradingsymbol}-${r.exchange}`}
            />
          )}
      </div>
    </div>
    </MainLayout>
  );
}
