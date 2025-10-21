'use client';

import { useEffect, useRef } from 'react';

interface SparklineProps {
  points: { x: number; y: number }[];
  height?: number;
  positive?: boolean;
}

export default function Sparkline({ points, height = 40, positive }: SparklineProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!containerRef.current) return;
    let disposed = false;
    (async () => {
      const { createChart } = await import('lightweight-charts');
      if (disposed || !containerRef.current) return;
      chartRef.current = createChart(containerRef.current, {
        height,
        layout: { background: { color: 'transparent' }, textColor: '#6b7280' },
        grid: { horzLines: { color: 'transparent' }, vertLines: { color: 'transparent' } },
        rightPriceScale: { visible: false },
        leftPriceScale: { visible: false },
        timeScale: { visible: false },
        handleScroll: false,
        handleScale: false,
      });
      if (typeof chartRef.current.addAreaSeries === 'function') {
        seriesRef.current = chartRef.current.addAreaSeries({
          lineColor: positive ? '#22c55e' : '#ef4444',
          topColor: (positive ? '#22c55e' : '#ef4444') + '30',
          bottomColor: 'transparent',
        });
      }
      const width = containerRef.current.clientWidth || 160;
      chartRef.current.applyOptions({ width });
    })();
    return () => {
      disposed = true;
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, [height, positive]);

  useEffect(() => {
    if (!seriesRef.current) return;
    if (!Array.isArray(points) || points.length < 2) return;
    const data = points.map((p, i) => ({ time: i, value: p.y }));
    seriesRef.current.setData(data);
  }, [points]);

  return <div ref={containerRef} style={{ width: 160, height }} />;
}


