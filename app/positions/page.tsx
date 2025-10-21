'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Position } from '@/types/kite';
import { DataGrid } from '@/components/DataGrid';
import type { ColDef } from 'ag-grid-community';

export default function Positions() {
  const router = useRouter();
  const [positions, setPositions] = useState<{
    net: Position[];
    day: Position[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const netColumns: ColDef<Position>[] = useMemo(
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
        headerName: 'P&L',
        valueGetter: (p) =>
          p.data
            ? `${p.data.pnl >= 0 ? '+' : ''}₹${p.data.pnl.toFixed(2)}`
            : '',
        width: 110,
      },
      { headerName: 'Product', field: 'product', width: 100 },
    ],
    []
  );

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/positions');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/');
          return;
        }
        throw new Error('Failed to fetch positions');
      }
      const data = await response.json();
      setPositions(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load positions');
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
              Loading positions...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // netColumns declared above

  const calculateTotalPnL = (positionsList: Position[]) => {
    return positionsList.reduce((sum, pos) => sum + pos.pnl, 0);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Positions</h1>

        {error && (
          <div className="border border-black/10 dark:border-white/10 rounded-lg p-4 text-red-600 mb-6">
            {error}
          </div>
        )}

        {/* Net Positions */}
        <div className="rounded-lg border border-black/10 dark:border-white/10 mb-8">
          <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Net Positions</h2>
            {positions && positions.net.length > 0 && (
              <div className={`text-lg font-bold`}>
                Total P&L: {calculateTotalPnL(positions.net) >= 0 ? '+' : ''}₹
                {calculateTotalPnL(positions.net).toFixed(2)}
              </div>
            )}
          </div>
          <div className="p-4">
            {positions && (
              <DataGrid<Position>
                rowData={positions.net}
                columnDefs={netColumns}
                hasMore={false}
                height={420}
                getRowId={(r) => `${r.tradingsymbol}-${r.product}`}
              />
            )}
          </div>
        </div>

        {/* Day Positions */}
        <div className="rounded-lg border border-black/10 dark:border-white/10">
          <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Day Positions</h2>
            {positions && positions.day.length > 0 && (
              <div className={`text-lg font-bold`}>
                Total P&L: {calculateTotalPnL(positions.day) >= 0 ? '+' : ''}₹
                {calculateTotalPnL(positions.day).toFixed(2)}
              </div>
            )}
          </div>
          <div className="p-4">
            {positions && (
              <DataGrid<Position>
                rowData={positions.day}
                columnDefs={netColumns}
                hasMore={false}
                height={420}
                getRowId={(r) => `${r.tradingsymbol}-${r.product}-day`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
