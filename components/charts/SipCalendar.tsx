'use client';

import * as React from 'react';
import EChartsBase from './EChartsBase';

export interface SipDay {
  date: string; // YYYY-MM-DD
  amount: number; // invested amount
}

export interface SipCalendarProps {
  data: SipDay[];
}

export function SipCalendar({ data }: SipCalendarProps) {
  const getOption = React.useCallback(
    ({ isDark }: { isDark: boolean }) => {
      const calendarRange = [
        data.length > 0
          ? data[0].date.slice(0, 4)
          : new Date().getFullYear().toString(),
      ];
      return {
        backgroundColor: 'transparent',
        tooltip: { position: 'top' },
        visualMap: {
          min: 0,
          max: Math.max(1, Math.max(...data.map((d) => d.amount))),
          show: false,
          inRange: { color: isDark ? ['#111', '#fff'] : ['#fff', '#000'] },
        },
        calendar: {
          range: calendarRange,
          itemStyle: {
            borderWidth: 1,
            borderColor: isDark ? '#222' : '#eee',
          },
          dayLabel: { color: isDark ? '#bbb' : '#666' },
          monthLabel: { color: isDark ? '#bbb' : '#666' },
          yearLabel: { show: false },
        },
        series: [
          {
            type: 'heatmap',
            coordinateSystem: 'calendar',
            data: data.map((d) => [d.date, d.amount]),
          },
        ],
      };
    },
    [data]
  );

  return (
    <div className="w-full h-56">
      <EChartsBase getOption={getOption as any} />
    </div>
  );
}

export default SipCalendar;
