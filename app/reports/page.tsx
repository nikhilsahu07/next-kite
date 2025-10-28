'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/reports');
        if (!res.ok) throw new Error('Failed');
        setData(await res.json());
      } catch (e:any) {
        setError(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Reports</h1>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          data && (
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-3">Summary</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="border rounded p-4">
                    <div className="text-xs text-black/60 dark:text-white/60 mb-1">Total Orders</div>
                    <div className="text-2xl font-bold">{data.summary.totals.orders}</div>
                  </div>
                  <div className="border rounded p-4">
                    <div className="text-xs text-black/60 dark:text-white/60 mb-1">Trades</div>
                    <div className="text-2xl font-bold">{data.summary.totals.trades}</div>
                  </div>
                  <div className="border rounded p-4">
                    <div className="text-xs text-black/60 dark:text-white/60 mb-1">Open Positions</div>
                    <div className="text-2xl font-bold">{data.summary.totals.openPositions}</div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Orders</h2>
                <div className="overflow-auto border rounded">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Symbol</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-right p-2">Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.orders.map((o:any, idx:number) => (
                        <tr key={idx} className="border-b">
                          <td className="p-2">{o.tradingsymbol}</td>
                          <td className="p-2">{o.transaction_type}</td>
                          <td className="p-2">{o.status}</td>
                          <td className="p-2 text-right">{o.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Trades</h2>
                <div className="overflow-auto border rounded">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Symbol</th>
                        <th className="text-left p-2">Side</th>
                        <th className="text-right p-2">Qty</th>
                        <th className="text-right p-2">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.trades.map((t:any, idx:number) => (
                        <tr key={idx} className="border-b">
                          <td className="p-2">{t.tradingsymbol}</td>
                          <td className="p-2">{t.transaction_type}</td>
                          <td className="p-2 text-right">{t.quantity}</td>
                          <td className="p-2 text-right">{Number(t.price || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )
        )}
      </div>
    </MainLayout>
  );
}


