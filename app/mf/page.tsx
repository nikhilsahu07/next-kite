'use client';

import { useEffect, useMemo, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { DataGrid } from '@/components/DataGrid';
import type { ColDef } from 'ag-grid-community';

export default function MutualFundsPage() {
  const [holdings, setHoldings] = useState<any[]>([]);
  const [instruments, setInstruments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [sips, setSips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const holdingsColumns: ColDef<any>[] = useMemo(
    () => [
      { headerName: 'Fund', field: 'fund', width: 200 },
      { headerName: 'Symbol', field: 'tradingsymbol', width: 120 },
      { headerName: 'Qty', field: 'quantity', width: 100 },
      {
        headerName: 'Avg Price',
        valueGetter: (p) => p.data ? `₹${Number(p.data.average_price || 0).toFixed(2)}` : '',
        width: 120,
      },
      {
        headerName: 'LTP',
        valueGetter: (p) => p.data ? `₹${Number(p.data.last_price || 0).toFixed(2)}` : '',
        width: 120,
      },
      {
        headerName: 'P&L',
        valueGetter: (p) => p.data ? `${Number(p.data.pnl || 0) >= 0 ? '+' : ''}₹${Number(p.data.pnl || 0).toFixed(2)}` : '',
        width: 120,
        cellClassRules: {
          'text-green-600': (params: any) => Number(params.data?.pnl || 0) >= 0,
          'text-red-600': (params: any) => Number(params.data?.pnl || 0) < 0,
        },
      },
    ],
    []
  );

  const sipsColumns: ColDef<any>[] = useMemo(
    () => [
      { headerName: 'Fund', field: 'tradingsymbol', width: 200 },
      {
        headerName: 'Amount',
        valueGetter: (p) => p.data ? `₹${Number(p.data.installment_amount || 0).toFixed(2)}` : '',
        width: 120,
      },
      { headerName: 'Frequency', field: 'frequency', width: 120 },
      { headerName: 'Status', field: 'status', width: 120 },
      { headerName: 'Next Installment', field: 'next_installment_date', width: 150 },
    ],
    []
  );

  const ordersColumns: ColDef<any>[] = useMemo(
    () => [
      { headerName: 'Symbol', field: 'tradingsymbol', width: 150 },
      { headerName: 'Type', field: 'transaction_type', width: 100 },
      { headerName: 'Qty', field: 'quantity', width: 100 },
      { headerName: 'Status', field: 'status', width: 120 },
      { headerName: 'Order Time', field: 'order_timestamp', width: 150 },
    ],
    []
  );

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [h, i, o, s] = await Promise.all([
        fetch('/api/mf/holdings'),
        fetch('/api/mf/instruments'),
        fetch('/api/mf/orders'),
        fetch('/api/mf/sips'),
      ]);
      if (h.ok) setHoldings(await h.json());
      if (i.ok) setInstruments(await i.json());
      if (o.ok) setOrders(await o.json());
      if (s.ok) setSips(await s.json());
    } catch (e) {
      setError('Failed to load mutual funds data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total investment and current value
  const stats = useMemo(() => {
    const totalInvested = (holdings || []).reduce((sum, h) => sum + (h.average_price * h.quantity), 0);
    const currentValue = (holdings || []).reduce((sum, h) => sum + (h.last_price * h.quantity), 0);
    const totalPnL = (holdings || []).reduce((sum, h) => sum + (h.pnl || 0), 0);
    const activeSips = (sips || []).filter((s: any) => s.status === 'ACTIVE').length;
    const totalSipAmount = (sips || []).filter((s: any) => s.status === 'ACTIVE').reduce((sum: number, s: any) => sum + (s.instalment_amount || s.installment_amount || 0), 0);
    
    return { totalInvested, currentValue, totalPnL, activeSips, totalSipAmount };
  }, [holdings, sips]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            🏦 Mutual Funds Portfolio
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track your mutual fund investments, SIPs, and orders
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
              <p className="text-lg text-slate-600 dark:text-slate-400">Loading portfolio...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Invested</div>
                <div className="text-2xl font-bold text-slate-800 dark:text-white">
                  ₹{stats.totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Current Value</div>
                <div className="text-2xl font-bold text-slate-800 dark:text-white">
                  ₹{stats.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total P&L</div>
                <div className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.totalPnL >= 0 ? '+' : ''}₹{stats.totalPnL.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Active SIPs</div>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.activeSips}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Monthly SIP</div>
                <div className="text-2xl font-bold text-blue-600">
                  ₹{stats.totalSipAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>

            {/* Holdings */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">📈 Holdings</h2>
                <div className="text-sm text-slate-600 dark:text-slate-400">{(holdings || []).length} funds</div>
              </div>
              <DataGrid<any>
                rowData={holdings || []}
                columnDefs={holdingsColumns}
                hasMore={false}
                height={400}
                getRowId={(r) => `${r.tradingsymbol}-${r.fund}`}
              />
            </section>

            {/* SIPs */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">🔄 Systematic Investment Plans</h2>
                <div className="text-sm text-slate-600 dark:text-slate-400">{(sips || []).length} SIPs</div>
              </div>
              <DataGrid<any>
                rowData={sips || []}
                columnDefs={sipsColumns}
                hasMore={false}
                height={300}
                getRowId={(r) => `${r.tradingsymbol}-${r.sip_id}`}
              />
            </section>

            {/* Orders */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">📋 Recent Orders</h2>
                <div className="text-sm text-slate-600 dark:text-slate-400">{(orders || []).length} orders (last 7 days)</div>
              </div>
              <DataGrid<any>
                rowData={orders || []}
                columnDefs={ordersColumns}
                hasMore={false}
                height={300}
                getRowId={(r) => `${r.order_id}`}
              />
            </section>
          </div>
        )}
      </div>
    </MainLayout>
  );
}


