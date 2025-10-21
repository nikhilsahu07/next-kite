'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import DepthChart from '@/components/charts/DepthChart';
import Sparkline from '@/components/charts/Sparkline';
import LiveCandlesCard from '@/components/charts/LiveCandlesCard';

export default function LivePage() {
  const [quotes, setQuotes] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const instruments = ['NSE:RELIANCE', 'NSE:HDFCBANK', 'NSE:INFY'];

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ type: 'quote', instruments: instruments.join(',') });
      const res = await fetch(`/api/quotes?${params.toString()}`);
      if (res.ok) setQuotes(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
    const t = setInterval(fetchQuotes, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Live Market</h1>

        <div className="grid md:grid-cols-3 gap-4">
          {instruments.map((sym) => {
            const q = quotes[sym] || {};
            const spark = (q.ohlc ? [
              { x: 0, y: q.ohlc.open },
              { x: 1, y: q.last_price },
            ] : []);
            return (
              <div key={sym} className="border rounded p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold">{sym}</div>
                  <div className="text-right">
                    <div className="text-lg font-bold">₹{Number(q.last_price || 0).toFixed(2)}</div>
                    {q.ohlc && (
                      <div className="text-xs text-black/60 dark:text-white/60">Prev Close: ₹{Number(q.ohlc.close || 0).toFixed(2)}</div>
                    )}
                  </div>
                </div>
                <Sparkline points={spark} positive={Number(q.last_price || 0) >= Number(q.ohlc?.close || 0)} />
                <div className="mt-3">
                  <LiveCandlesCard symbol={sym} height={260} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Depth</h2>
          <DepthChart bids={[{ price: 2500, quantity: 100 }, { price: 2495, quantity: 250 }]} asks={[{ price: 2510, quantity: 120 }, { price: 2515, quantity: 200 }]} />
        </div>
      </div>
    </div>
  );
}


