'use client';

import * as React from 'react';
import EChartsBase from './EChartsBase';

export interface VolumeBin {
  price: number;
  volume: number;
}

export interface VolumeProfileProps {
  bins: VolumeBin[];
}

export function VolumeProfile({ bins }: VolumeProfileProps) {
  const getOption = React.useCallback(
    ({ isDark }: { isDark: boolean }) => {
      return {
        backgroundColor: 'transparent',
        grid: { left: 10, right: 10, top: 10, bottom: 20 },
        xAxis: {
          type: 'category',
          data: bins.map((b) => b.price),
          axisLabel: { formatter: (v: any) => `${v}` },
          axisLine: { lineStyle: { color: isDark ? '#aaa' : '#555' } },
          splitLine: { show: false },
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: isDark ? '#aaa' : '#555' } },
          splitLine: { lineStyle: { color: isDark ? '#222' : '#eee' } },
        },
        series: [
          {
            type: 'bar',
            data: bins.map((b) => b.volume),
            itemStyle: { color: isDark ? '#999' : '#333' },
            barWidth: '70%',
          },
        ],
        tooltip: { trigger: 'axis' },
      };
    },
    [bins]
  );

  return (
    <div className="w-full h-48">
      <EChartsBase getOption={getOption as any} />
    </div>
  );
}

export default VolumeProfile;
