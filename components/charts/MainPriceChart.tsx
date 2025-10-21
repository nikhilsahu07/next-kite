'use client';

import * as React from 'react';
import {
  createChart,
  ColorType,
  ISeriesApi,
  UTCTimestamp,
} from 'lightweight-charts';
import { useTheme } from 'next-themes';

export interface Candle {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface MainPriceChartProps {
  candles: Candle[];
}

export function MainPriceChart({ candles }: MainPriceChartProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const seriesRef = React.useRef<ISeriesApi<'Candlestick'> | null>(null);
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  React.useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: isDark ? '#ddd' : '#111',
      },
      grid: {
        vertLines: { color: isDark ? '#222' : '#eee' },
        horzLines: { color: isDark ? '#222' : '#eee' },
      },
      rightPriceScale: { borderColor: isDark ? '#333' : '#ddd' },
      timeScale: { borderColor: isDark ? '#333' : '#ddd' },
    });
    const series = (chart as any).addCandlestickSeries({
      upColor: isDark ? '#27ae60' : '#1e8449',
      downColor: isDark ? '#e74c3c' : '#c0392b',
      borderVisible: false,
      wickUpColor: isDark ? '#27ae60' : '#1e8449',
      wickDownColor: isDark ? '#e74c3c' : '#c0392b',
    });
    seriesRef.current = series;
    series.setData(candles);

    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({
        width: containerRef.current?.clientWidth || 0,
        height: containerRef.current?.clientHeight || 0,
      });
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      seriesRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    if (!seriesRef.current) return;
    seriesRef.current.setData(candles);
  }, [candles]);

  return <div ref={containerRef} className="w-full h-72" />;
}

export default MainPriceChart;
