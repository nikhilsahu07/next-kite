'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

interface DepthPoint {
  price: number;
  quantity: number;
}

interface FinancialDepthChartProps {
  bids: DepthPoint[];
  asks: DepthPoint[];
  height?: number;
}

// Dynamic import to avoid SSR issues
const DepthChartInner = dynamic(
  () => import('./FinancialDepthChartInner'),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-64">Loading depth chart...</div> }
);

export default function FinancialDepthChart({
  bids,
  asks,
  height = 300,
}: FinancialDepthChartProps) {
  const [processedData, setProcessedData] = useState<{ bids: DepthPoint[]; asks: DepthPoint[] }>({ bids: [], asks: [] });

  useEffect(() => {
    if (!bids || !asks) return;

    // Sort bids descending (highest price first)
    const sortedBids = [...bids].sort((a, b) => b.price - a.price);
    
    // Sort asks ascending (lowest price first)
    const sortedAsks = [...asks].sort((a, b) => a.price - b.price);

    // Calculate cumulative quantities
    const processedBids = sortedBids.map((bid, i) => {
      const cumQty = sortedBids.slice(0, i + 1).reduce((sum, b) => sum + b.quantity, 0);
      return { price: bid.price, quantity: cumQty };
    }).reverse(); // Reverse to get ascending order for chart

    const processedAsks = sortedAsks.map((ask, i) => {
      const cumQty = sortedAsks.slice(0, i + 1).reduce((sum, a) => sum + a.quantity, 0);
      return { price: ask.price, quantity: cumQty };
    });

    setProcessedData({ bids: processedBids, asks: processedAsks });
  }, [bids, asks]);

  if (!processedData.bids.length && !processedData.asks.length) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-black/60 dark:text-white/60">No depth data available</p>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <DepthChartInner
        bids={processedData.bids}
        asks={processedData.asks}
        height={height}
      />
    </div>
  );
}


