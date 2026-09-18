'use client';

import { useEffect, useState, useRef } from 'react';
import { Chart, ChartCanvas } from 'react-financial-charts';
import { XAxis, YAxis } from 'react-financial-charts';
import { AreaSeries } from 'react-financial-charts';
import { scaleLinear } from 'd3-scale';
import { format } from 'd3-format';

interface DepthPoint {
  price: number;
  quantity: number;
}

interface FinancialDepthChartInnerProps {
  bids: DepthPoint[];
  asks: DepthPoint[];
  height: number;
}

export default function FinancialDepthChartInner({
  bids,
  asks,
  height,
}: FinancialDepthChartInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: height });
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

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setDimensions({ width: Math.max(width, 400), height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    const timer = setTimeout(updateDimensions, 100);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(timer);
    };
  }, [height]);

  if (!bids.length && !asks.length) {
    return <div className="text-black/60 dark:text-white/60">No depth data available</div>;
  }

  // Combine and prepare data for the chart
  const allData = [...bids, ...asks].sort((a, b) => a.price - b.price);
  
  // Create x and y scales
  const xScale = scaleLinear()
    .domain([Math.min(...allData.map(d => d.price)), Math.max(...allData.map(d => d.price))])
    .range([0, dimensions.width]);

  const maxQuantity = Math.max(...allData.map(d => d.quantity));
  const yScale = scaleLinear()
    .domain([0, maxQuantity * 1.1])
    .range([height - 50, 0]);

  const gridHeight = height - 50;
  const margin = { left: 10, right: 70, top: 10, bottom: 30 };
  
  // Theme colors
  const gridColor = isDark ? '#1f2937' : '#e5e7eb';
  const textColor = isDark ? '#d1d5db' : '#374151';

  // Formatters
  const priceFormat = format('.2f');
  const quantityFormat = format('.0f');

  // Find the midpoint price (between highest bid and lowest ask)
  const highestBid = bids.length > 0 ? Math.max(...bids.map(b => b.price)) : 0;
  const lowestAsk = asks.length > 0 ? Math.min(...asks.map(a => a.price)) : 0;
  const midPrice = (highestBid + lowestAsk) / 2;

  // Prepare data for bid and ask area series
  const bidData = bids.map((bid, index) => ({
    x: bid.price,
    y: bid.quantity,
    index,
  }));

  const askData = asks.map((ask, index) => ({
    x: ask.price,
    y: ask.quantity,
    index: bids.length + index,
  }));

  const chartData = [...bidData, ...askData];
  
  // Custom accessor functions
  const xAccessor = (d: any) => d.index;
  const displayXAccessor = (d: any) => d.x;

  return (
    <div ref={containerRef} className="w-full border border-black/10 dark:border-white/10 rounded-lg p-4 bg-white dark:bg-black">
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Order Book Depth</h4>
        <div className="flex gap-4 text-xs mt-1">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            <span className="text-gray-600 dark:text-gray-400">Bids</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
            <span className="text-gray-600 dark:text-gray-400">Asks</span>
          </div>
        </div>
      </div>

      {/* Simple visualization using divs for better compatibility */}
      <div className="relative" style={{ height: height - 80 }}>
        <div className="flex h-full items-end">
          {/* Bids section */}
          <div className="flex-1 flex items-end justify-end gap-1 pr-2">
            {bids.slice().reverse().slice(0, 10).map((bid, i) => {
              const heightPercent = (bid.quantity / maxQuantity) * 100;
              return (
                <div
                  key={`bid-${i}`}
                  className="relative group cursor-pointer"
                  style={{ flex: 1, height: `${heightPercent}%`, minWidth: '20px' }}
                >
                  <div className="w-full h-full bg-green-500/60 hover:bg-green-500/80 transition-colors rounded-t"></div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                    <div>Price: ₹{priceFormat(bid.price)}</div>
                    <div>Qty: {quantityFormat(bid.quantity)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center divider */}
          <div className="w-px bg-gray-400 dark:bg-gray-600 h-full"></div>

          {/* Asks section */}
          <div className="flex-1 flex items-end gap-1 pl-2">
            {asks.slice(0, 10).map((ask, i) => {
              const heightPercent = (ask.quantity / maxQuantity) * 100;
              return (
                <div
                  key={`ask-${i}`}
                  className="relative group cursor-pointer"
                  style={{ flex: 1, height: `${heightPercent}%`, minWidth: '20px' }}
                >
                  <div className="w-full h-full bg-red-500/60 hover:bg-red-500/80 transition-colors rounded-t"></div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                    <div>Price: ₹{priceFormat(ask.price)}</div>
                    <div>Qty: {quantityFormat(ask.quantity)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Price labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
          <span>Bid: ₹{highestBid > 0 ? priceFormat(highestBid) : 'N/A'}</span>
          <span className="font-semibold">Spread: ₹{lowestAsk > 0 && highestBid > 0 ? priceFormat(lowestAsk - highestBid) : 'N/A'}</span>
          <span>Ask: ₹{lowestAsk > 0 ? priceFormat(lowestAsk) : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}


