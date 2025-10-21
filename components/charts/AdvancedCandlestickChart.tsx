'use client';

import { useEffect, useRef, useState } from 'react';

interface CandleData {
  time: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface AdvancedCandlestickChartProps {
  data: CandleData[];
  height?: number;
  showVolume?: boolean;
  showMA?: boolean;
  ma1Period?: number;
  ma2Period?: number;
}

export default function AdvancedCandlestickChart({
  data,
  height = 600,
  showVolume = true,
  showMA = true,
  ma1Period = 20,
  ma2Period = 50,
}: AdvancedCandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candleSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const ma1SeriesRef = useRef<any>(null);
  const ma2SeriesRef = useRef<any>(null);
  const [isDark, setIsDark] = useState(false);

  // Check theme
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Calculate Moving Average
  const calculateMA = (data: CandleData[], period: number) => {
    const ma: { time: number; value: number }[] = [];
    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      ma.push({
        time:
          typeof data[i].time === 'string'
            ? Math.floor(new Date(data[i].time).getTime() / 1000)
            : (data[i].time as number),
        value: sum / period,
      });
    }
    return ma;
  };

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (typeof window === 'undefined') return;

    let disposed = false;
    let resizeHandler: (() => void) | null = null;

    const loadChart = async () => {
      try {
        const { createChart } = await import('lightweight-charts');

        if (disposed || !chartContainerRef.current) return;

        // Clean up existing chart
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
        }

        const bgColor = isDark ? '#000000' : '#ffffff';
        const textColor = isDark ? '#d1d5db' : '#374151';
        const gridColor = isDark ? '#1f2937' : '#e5e7eb';

        const chart: any = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: height,
          layout: {
            background: { color: bgColor },
            textColor: textColor,
          },
          grid: {
            vertLines: { color: gridColor },
            horzLines: { color: gridColor },
          },
          crosshair: {
            mode: 1,
          },
          rightPriceScale: {
            borderColor: gridColor,
            scaleMargins: {
              top: 0.1,
              bottom: showVolume ? 0.3 : 0.1,
            },
          },
          timeScale: {
            borderColor: gridColor,
            timeVisible: true,
            secondsVisible: false,
          },
        });

        if (disposed) {
          chart.remove();
          return;
        }

        chartRef.current = chart;

        // Add candlestick series
        if (typeof chart.addCandlestickSeries === 'function') {
          const candleSeries = chart.addCandlestickSeries({
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderUpColor: '#22c55e',
            borderDownColor: '#ef4444',
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
          });
          candleSeriesRef.current = candleSeries;
        }

        // Add volume series if enabled
        if (showVolume && typeof chart.addHistogramSeries === 'function') {
          const volumeSeries = chart.addHistogramSeries({
            color: '#26a69a',
            priceFormat: { type: 'volume' },
            priceScaleId: 'volume',
          });
          if (typeof chart.priceScale === 'function') {
            chart.priceScale('volume')?.applyOptions?.({
              scaleMargins: { top: 0.7, bottom: 0 },
            });
          }
          volumeSeriesRef.current = volumeSeries;
        }

        // Add MA series if enabled
        if (showMA) {
          if (typeof chart.addLineSeries === 'function') {
            const ma1Series = chart.addLineSeries({
              color: '#2196F3',
              lineWidth: 2,
              title: `MA${ma1Period}`,
            });
            ma1SeriesRef.current = ma1Series;

            const ma2Series = chart.addLineSeries({
              color: '#FF6D00',
              lineWidth: 2,
              title: `MA${ma2Period}`,
            });
            ma2SeriesRef.current = ma2Series;
          }
        }

        // Handle resize
        resizeHandler = () => {
          if (chartContainerRef.current && chartRef.current) {
            chartRef.current.applyOptions({
              width: chartContainerRef.current.clientWidth,
            });
          }
        };

        window.addEventListener('resize', resizeHandler);
      } catch (error) {
        console.error('Error loading chart:', error);
      }
    };

    loadChart();

    return () => {
      disposed = true;
      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
      }
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
      ma1SeriesRef.current = null;
      ma2SeriesRef.current = null;
    };
  }, [height, showVolume, showMA, ma1Period, ma2Period, isDark]);

  // Update data
  useEffect(() => {
    if (!data || data.length === 0) return;
    if (!candleSeriesRef.current) return;

    // Prepare candlestick data
    const candleData = data.map((d) => ({
      time:
        typeof d.time === 'string'
          ? Math.floor(new Date(d.time).getTime() / 1000)
          : (d.time as number),
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    candleSeriesRef.current.setData?.(candleData);

    // Update volume data
    if (showVolume && volumeSeriesRef.current && data[0]?.volume !== undefined) {
      const volumeData = data.map((d, i) => ({
        time:
          typeof d.time === 'string'
            ? Math.floor(new Date(d.time).getTime() / 1000)
            : (d.time as number),
        value: d.volume || 0,
        color: (d.close >= d.open) ? '#22c55e80' : '#ef444480',
      }));
      volumeSeriesRef.current.setData?.(volumeData);
    }

    // Update MA data
    if (showMA) {
      if (ma1SeriesRef.current && data.length >= ma1Period) {
        const ma1Data = calculateMA(data, ma1Period);
        ma1SeriesRef.current.setData?.(ma1Data);
      }

      if (ma2SeriesRef.current && data.length >= ma2Period) {
        const ma2Data = calculateMA(data, ma2Period);
        ma2SeriesRef.current.setData?.(ma2Data);
      }
    }

    // Fit content
    if (chartRef.current) {
      chartRef.current.timeScale?.().fitContent?.();
    }
  }, [data, showVolume, showMA, ma1Period, ma2Period]);

  return (
    <div 
      ref={chartContainerRef} 
      style={{ height: `${height}px` }}
      className="w-full rounded-lg overflow-hidden border border-black/10 dark:border-white/10"
    />
  );
}

