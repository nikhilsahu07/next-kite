'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

interface CandleData {
  time: string | Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface FinancialCandlestickChartProps {
  data: CandleData[];
  height?: number;
  showMA?: boolean;
  ma1Period?: number;
  ma2Period?: number;
}

interface ChartPoint {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma1?: number;
  ma2?: number;
}

// Dynamic import to avoid SSR issues
const ChartComponent = dynamic(
  () => import('./FinancialChartInner'),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-96">Loading chart...</div> }
);

export default function FinancialCandlestickChart({
  data,
  height = 600,
  showMA = true,
  ma1Period = 20,
  ma2Period = 50,
}: FinancialCandlestickChartProps) {
  const [processedData, setProcessedData] = useState<ChartPoint[]>([]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const processed: ChartPoint[] = data.map((candle) => ({
      date: candle.time instanceof Date ? candle.time : new Date(candle.time),
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume || 0,
    }));

    // Sort by date
    processed.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate MAs if needed
    if (showMA) {
      for (let i = 0; i < processed.length; i++) {
        // MA1
        if (i >= ma1Period - 1) {
          let sum = 0;
          for (let j = 0; j < ma1Period; j++) {
            sum += processed[i - j].close;
          }
          processed[i].ma1 = sum / ma1Period;
        }

        // MA2
        if (i >= ma2Period - 1) {
          let sum = 0;
          for (let j = 0; j < ma2Period; j++) {
            sum += processed[i - j].close;
          }
          processed[i].ma2 = sum / ma2Period;
        }
      }
    }

    setProcessedData(processed);
  }, [data, showMA, ma1Period, ma2Period]);

  if (!processedData || processedData.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-black/60 dark:text-white/60">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ChartComponent
        data={processedData}
        height={height}
        showMA={showMA}
        ma1Period={ma1Period}
        ma2Period={ma2Period}
      />
    </div>
  );
}

