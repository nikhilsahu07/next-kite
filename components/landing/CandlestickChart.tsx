'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

// Reuse our FinancialChart based on react-financial-charts for proper candles
const FinancialCandlestickChart = dynamic(
  () => import('@/components/charts/FinancialCandlestickChart'),
  { ssr: false }
);

interface CandlestickChartProps {
  height?: number;
}

type Candle = {
  time: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

export default function CandlestickChart({ height = 300 }: CandlestickChartProps) {
  const [candles, setCandles] = useState<Candle[]>([]);

  useEffect(() => {
    const generate = (prevClose: number): Candle => {
      const open = prevClose + (Math.random() - 0.5) * 2;
      const close = open + (Math.random() - 0.5) * 3;
      const high = Math.max(open, close) + Math.random() * 1.5;
      const low = Math.min(open, close) - Math.random() * 1.5;
      return {
        time: new Date(),
        open,
        high,
        low,
        close,
        volume: Math.floor(1000 + Math.random() * 4000),
      };
    };

    const seed: Candle[] = [];
    let last = 100;
    const now = Date.now();
    for (let i = 60; i > 0; i--) {
      const c = generate(last);
      last = c.close;
      // backdate to create a sequence
      c.time = new Date(now - i * 60 * 1000);
      seed.push(c);
    }
    setCandles(seed);

    const t = setInterval(() => {
      setCandles((prev) => {
        const lastClose = prev[prev.length - 1]?.close ?? 100;
        const c = generate(lastClose);
        return [...prev.slice(-59), c];
      });
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const data = useMemo(() => candles, [candles]);

  return (
    <div style={{ height }}>
      <FinancialCandlestickChart data={data as any} height={height} />
    </div>
  );
}

