'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import FinancialCandlestickChart from './FinancialCandlestickChart';
import { useTicker } from '@/hooks/useTicker';

interface CandlePoint {
  time: Date | string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface LiveCandlesCardProps {
  symbol: string; // e.g. "NSE:RELIANCE"
  height?: number;
  interval?: '1minute' | '3minute' | '5minute' | '10minute' | '15minute';
}

export default function LiveCandlesCard({ symbol, height = 380, interval = '1minute' }: LiveCandlesCardProps) {
  const [data, setData] = useState<CandlePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<{ apiKey: string; accessToken: string } | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  const title = useMemo(() => symbol.split(':')[1] || symbol, [symbol]);

  const loadHistorical = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch last ~2 days of 5-minute candles using server API if available.
      // Fallback: derive instrument token via /api/instruments/search
      const search = await fetch(`/api/instruments/search?query=${encodeURIComponent(title)}`);
      const searchJson = await search.json();
      const match = Array.isArray(searchJson) ? searchJson.find((i: any) => `${i.exchange}:${i.tradingsymbol}` === symbol) : null;
      if (!match) throw new Error('Instrument not found');

      const token = match.instrument_token;
      const to = new Date();
      const from = new Date(to.getTime() - 2 * 24 * 60 * 60 * 1000);

      const params = new URLSearchParams({
        instrument_token: String(token),
        interval,
        from: from.toISOString(),
        to: to.toISOString(),
        continuous: 'false',
        oi: 'false',
      });

      const res = await fetch(`/api/historical?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch candles');
      const json = await res.json();
      const candles = Array.isArray(json?.data?.candles) ? json.data.candles : [];

      const mapped: CandlePoint[] = candles.map((c: any[]) => ({
        time: c[0],
        open: Number(c[1]),
        high: Number(c[2]),
        low: Number(c[3]),
        close: Number(c[4]),
        volume: Number(c[5] || 0),
      }));

      setData(mapped);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistorical();
    // Light refresh of full history every 5 minutes in case of drift
    const refresh = setInterval(loadHistorical, 5 * 60 * 1000);
    return () => clearInterval(refresh);
  }, [symbol, interval]);

  // Live updater: poll last price frequently and aggregate to running candle
  useEffect(() => {
    if (!symbol) return;

    let cancelled = false;

    const bucketMsMap: Record<NonNullable<LiveCandlesCardProps['interval']>, number> = {
      '1minute': 60 * 1000,
      '3minute': 3 * 60 * 1000,
      '5minute': 5 * 60 * 1000,
      '10minute': 10 * 60 * 1000,
      '15minute': 15 * 60 * 1000,
    };

    const bucketMs = bucketMsMap[interval] || 60 * 1000;

    const tick = async () => {
      try {
        // Use quotes API for a single symbol
        const res = await fetch(`/api/quotes?${new URLSearchParams({ instruments: symbol }).toString()}`);
        if (!res.ok) return;
        const json = await res.json();
        const q = json?.[symbol];
        if (!q) return;

        const price = Number(q.last_price || q.ohlc?.close || 0);
        if (!price) return;

        const now = new Date();
        const bucketStart = new Date(Math.floor(now.getTime() / bucketMs) * bucketMs);

        setData((prev) => {
          if (cancelled) return prev;
          if (prev.length === 0) {
            return [
              {
                time: bucketStart.toISOString(),
                open: price,
                high: price,
                low: price,
                close: price,
              },
            ];
          }

          const last = prev[prev.length - 1];
          const lastBucket = new Date(typeof last.time === 'string' ? last.time : last.time.toISOString());
          const sameBucket = Math.floor(lastBucket.getTime() / bucketMs) === Math.floor(bucketStart.getTime() / bucketMs);

          if (sameBucket) {
            // Update running candle
            const updated = {
              ...last,
              high: Math.max(last.high, price),
              low: Math.min(last.low, price),
              close: price,
            };
            return [...prev.slice(0, -1), updated];
          }

          // Start new candle
          return [
            ...prev,
            {
              time: bucketStart.toISOString(),
              open: last.close,
              high: Math.max(last.close, price),
              low: Math.min(last.close, price),
              close: price,
            },
          ];
        });
      } catch {}
    };

    const id = setInterval(tick, 2000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [symbol, interval]);

  // WebSocket streaming using TickerService
  useEffect(() => {
    let canceled = false;
    const setup = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (!res.ok) return;
        const s = await res.json();
        if (!s?.apiKey || !s?.accessToken) return;
        if (canceled) return;
        setSession({ apiKey: s.apiKey, accessToken: s.accessToken });
      } catch {}
    };
    setup();
    return () => {
      canceled = true;
    };
  }, []);

  const ticker = useTicker(session?.apiKey || '', session?.accessToken || '');

  useEffect(() => {
    if (!session || !ticker || !symbol) return;

    let token: number | null = null;
    let mounted = true;

    const start = async () => {
      try {
        // Resolve token via instruments search API
        const q = symbol.includes(':') ? symbol.split(':')[1] : symbol;
        const res = await fetch(`/api/instruments/search?${new URLSearchParams({ q }).toString()}`);
        const arr = await res.json();
        const hit = Array.isArray(arr) ? arr.find((i: any) => `${i.exchange}:${i.tradingsymbol}` === symbol) || arr[0] : null;
        if (!hit) return;
        token = Number(hit.instrument_token);
        if (!token || !mounted) return;
        ticker.subscribe([token], 'quote');
        unsubRef.current = ticker.onTick(token, (tk) => {
          const price = Number(tk.last_price || 0) / 1; // already in rupees via client lib
          if (!price) return;

          const bucketMsMap: Record<NonNullable<LiveCandlesCardProps['interval']>, number> = {
            '1minute': 60 * 1000,
            '3minute': 3 * 60 * 1000,
            '5minute': 5 * 60 * 1000,
            '10minute': 10 * 60 * 1000,
            '15minute': 15 * 60 * 1000,
          };
          const bucketMs = bucketMsMap[interval] || 60 * 1000;
          const now = new Date();
          const bucketStart = new Date(Math.floor(now.getTime() / bucketMs) * bucketMs);

          setData((prev) => {
            if (prev.length === 0) {
              return [
                { time: bucketStart.toISOString(), open: price, high: price, low: price, close: price },
              ];
            }
            const last = prev[prev.length - 1];
            const lastBucket = new Date(typeof last.time === 'string' ? last.time : last.time.toISOString());
            const sameBucket = Math.floor(lastBucket.getTime() / bucketMs) === Math.floor(bucketStart.getTime() / bucketMs);
            if (sameBucket) {
              const updated = { ...last, high: Math.max(last.high, price), low: Math.min(last.low, price), close: price };
              return [...prev.slice(0, -1), updated];
            }
            return [
              ...prev,
              { time: bucketStart.toISOString(), open: last.close, high: Math.max(last.close, price), low: Math.min(last.close, price), close: price },
            ];
          });
        });
      } catch {}
    };
    start();

    return () => {
      mounted = false;
      if (token) ticker.unsubscribe([token]);
      if (unsubRef.current) unsubRef.current();
      unsubRef.current = null;
    };
  }, [session, symbol, interval]);

  return (
    <div className="border rounded p-3 bg-white dark:bg-black">
      <div className="flex justify-between items-center mb-3">
        <div className="font-semibold">{symbol}</div>
        {loading ? (
          <div className="text-xs text-black/60 dark:text-white/60">Updating…</div>
        ) : error ? (
          <div className="text-xs text-red-600">{error}</div>
        ) : null}
      </div>

      <FinancialCandlestickChart data={data} height={height} />
    </div>
  );
}


