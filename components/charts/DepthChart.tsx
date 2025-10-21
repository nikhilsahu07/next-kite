'use client';

import ReactECharts from 'echarts-for-react';

interface DepthPoint { price: number; quantity: number }

interface DepthChartProps {
  bids: DepthPoint[];
  asks: DepthPoint[];
  height?: number;
}

export default function DepthChart({ bids, asks, height = 260 }: DepthChartProps) {
  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: 30, right: 20, top: 10, bottom: 30 },
    xAxis: { type: 'value', axisLine: { lineStyle: { color: '#9ca3af' } } },
    yAxis: { type: 'value', axisLine: { lineStyle: { color: '#9ca3af' } } },
    series: [
      {
        name: 'Bids', type: 'line', step: 'end', areaStyle: {}, itemStyle: { color: '#22c55e' },
        data: bids.map(p => [p.price, p.quantity])
      },
      {
        name: 'Asks', type: 'line', step: 'end', areaStyle: {}, itemStyle: { color: '#ef4444' },
        data: asks.map(p => [p.price, p.quantity])
      },
    ],
  };
  return <ReactECharts option={option} style={{ height }} />;
}


