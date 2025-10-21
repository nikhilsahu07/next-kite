'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';

const loadLW = async () => await import('lightweight-charts');

interface Candle {
  time: number | any;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface MainChartProps {
  candles: Candle[];
  height?: number;
}

export default function MainChart({ candles, height = 420 }: MainChartProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const seriesRef = useRef<any>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!ref.current) return;
    let disposed = false;
    (async () => {
      const { createChart } = await loadLW();
      if (disposed || !ref.current) return;
      if (!chartRef.current) {
        chartRef.current = createChart(ref.current, {
          height,
          layout: { background: { color: 'transparent' }, textColor: '#6b7280' },
          grid: { horzLines: { color: '#e5e7eb' }, vertLines: { color: '#e5e7eb' } },
          rightPriceScale: { borderVisible: false },
          timeScale: { borderVisible: false },
          crosshair: { mode: 0 },
        });
        if (typeof chartRef.current.addCandlestickSeries === 'function') {
          seriesRef.current = chartRef.current.addCandlestickSeries({
            upColor: '#22c55e', downColor: '#ef4444', wickUpColor: '#22c55e', wickDownColor: '#ef4444',
            borderVisible: false,
          });
        }
      } else {
        chartRef.current.applyOptions({ height });
      }
      const handleResize = () => {
        if (!ref.current || !chartRef.current) return;
        const width = ref.current.clientWidth;
        chartRef.current.applyOptions({ width });
      };
      window.addEventListener('resize', handleResize);
      handleResize();
      return () => {
        disposed = true;
        window.removeEventListener('resize', handleResize);
      };
    })();
  }, [height]);

  useEffect(() => {
    if (!seriesRef.current) return;
    const data = (candles || []).map((c) => ({
      time: typeof c.time === 'number' ? c.time : Math.floor(new Date(c.time).getTime() / 1000),
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    seriesRef.current.setData(data);
  }, [candles]);

  return <div ref={ref} className="w-full" />;
}


