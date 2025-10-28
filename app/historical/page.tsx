'use client';

import { useEffect, useMemo, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import InstrumentSearch from '@/components/InstrumentSearch';
import MainChart from '@/components/charts/MainChart';
import dayjs from 'dayjs';

export default function HistoricalPage() {
  const [symbol, setSymbol] = useState('NSE:RELIANCE');
  const [interval, setInterval] = useState('day');
  const [from, setFrom] = useState(dayjs().subtract(6, 'month').format('YYYY-MM-DD'));
  const [to, setTo] = useState(dayjs().format('YYYY-MM-DD'));
  const [candles, setCandles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const instrumentToken = useMemo(() => null, [symbol]); // token resolution can be added via instruments API

  const fetchCandles = async () => {
    try {
      setLoading(true);
      setError('');
      // For demo: if no token, skip
      if (!instrumentToken) {
        setCandles([]);
        setLoading(false);
        return;
      }
      const params = new URLSearchParams({
        instrument_token: String(instrumentToken),
        interval,
        from,
        to,
      });
      const res = await fetch(`/api/historical?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      const mapped = (data || []).map((c: any) => ({
        time: Math.floor(new Date(c.date).getTime() / 1000),
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));
      setCandles(mapped);
    } catch (e:any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    //fetchCandles(); // enable once instrument_token mapping ready
  }, [symbol, interval, from, to]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Historical Data</h1>
        <div className="grid md:grid-cols-4 gap-4 mb-4">
          <InstrumentSearch label="Symbol" exchange="NSE" value={symbol} onChange={setSymbol as any} />
          <div>
            <label className="block text-xs text-black/60 dark:text-white/60 mb-1">Interval</label>
            <select className="w-full border px-3 py-2 bg-transparent" value={interval} onChange={(e) => setInterval(e.target.value)}>
              <option value="minute">minute</option>
              <option value="5minute">5minute</option>
              <option value="15minute">15minute</option>
              <option value="day">day</option>
              <option value="week">week</option>
              <option value="month">month</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-black/60 dark:text-white/60 mb-1">From</label>
            <input className="w-full border px-3 py-2 bg-transparent" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-black/60 dark:text-white/60 mb-1">To</label>
            <input className="w-full border px-3 py-2 bg-transparent" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>

        <div className="rounded border border-black/10 dark:border-white/10 p-4">
          {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
          {loading ? (
            <div>Loading...</div>
          ) : (
            <MainChart candles={candles as any} />
          )}
        </div>
      </div>
    </MainLayout>
  );
}


