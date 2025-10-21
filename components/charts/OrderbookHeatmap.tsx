'use client';

import * as React from 'react';
import EChartsBase from './EChartsBase';

export interface OrderbookHeatmapPoint {
  price: number;
  size: number; // positive for bids, negative for asks
}

export interface OrderbookHeatmapProps {
  data: OrderbookHeatmapPoint[];
}

export function OrderbookHeatmap({ data }: OrderbookHeatmapProps) {
  const getOption = React.useCallback(
    ({ isDark }: { isDark: boolean }) => {
      const bids = data.filter((d) => d.size > 0);
      const asks = data.filter((d) => d.size < 0);

      return {
        backgroundColor: 'transparent',
        grid: { left: 40, right: 10, top: 10, bottom: 25 },
        xAxis: {
          type: 'value',
          name: 'Price',
          axisLine: { lineStyle: { color: isDark ? '#aaa' : '#555' } },
          splitLine: { lineStyle: { color: isDark ? '#222' : '#eee' } },
        },
        yAxis: {
          type: 'value',
          name: 'Depth',
          axisLine: { lineStyle: { color: isDark ? '#aaa' : '#555' } },
          splitLine: { lineStyle: { color: isDark ? '#222' : '#eee' } },
        },
        series: [
          {
            type: 'scatter',
            name: 'Bids',
            itemStyle: { color: isDark ? '#27ae60' : '#1e8449' },
            symbolSize: (val: any) =>
              Math.min(24, Math.max(3, Math.sqrt(val[1]))),
            data: bids.map((d) => [d.price, d.size]),
          },
          {
            type: 'scatter',
            name: 'Asks',
            itemStyle: { color: isDark ? '#e74c3c' : '#c0392b' },
            symbolSize: (val: any) =>
              Math.min(24, Math.max(3, Math.sqrt(Math.abs(val[1])))),
            data: asks.map((d) => [d.price, Math.abs(d.size)]),
          },
        ],
        tooltip: {
          trigger: 'item',
          formatter: (p: any) => `Price: ${p.value[0]}<br/>Size: ${p.value[1]}`,
        },
      };
    },
    [data]
  );

  return (
    <div className="w-full h-64">
      <EChartsBase getOption={getOption as any} />
    </div>
  );
}

export default OrderbookHeatmap;
