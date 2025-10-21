'use client';

import * as React from 'react';
import EChartsBase from './EChartsBase';

export interface BreadthPoint {
  time: number; // epoch ms
  advancers: number;
  decliners: number;
}

export interface MarketBreadthProps {
  points: BreadthPoint[];
}

export function MarketBreadth({ points }: MarketBreadthProps) {
  const getOption = React.useCallback(
    ({ isDark }: { isDark: boolean }) => {
      return {
        backgroundColor: 'transparent',
        grid: { left: 40, right: 10, top: 10, bottom: 25 },
        xAxis: {
          type: 'time',
          axisLine: { lineStyle: { color: isDark ? '#aaa' : '#555' } },
          splitLine: { lineStyle: { color: isDark ? '#222' : '#eee' } },
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: isDark ? '#aaa' : '#555' } },
          splitLine: { lineStyle: { color: isDark ? '#222' : '#eee' } },
        },
        series: [
          {
            name: 'Advancers',
            type: 'line',
            showSymbol: false,
            smooth: true,
            itemStyle: { color: isDark ? '#27ae60' : '#1e8449' },
            data: points.map((p) => [p.time, p.advancers]),
          },
          {
            name: 'Decliners',
            type: 'line',
            showSymbol: false,
            smooth: true,
            itemStyle: { color: isDark ? '#e74c3c' : '#c0392b' },
            data: points.map((p) => [p.time, p.decliners]),
          },
        ],
        tooltip: { trigger: 'axis' },
        legend: { top: 0 },
      };
    },
    [points]
  );

  return (
    <div className="w-full h-48">
      <EChartsBase getOption={getOption as any} />
    </div>
  );
}

export default MarketBreadth;
