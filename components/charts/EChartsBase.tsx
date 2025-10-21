'use client';

import * as React from 'react';
import * as echarts from 'echarts';
import { useTheme } from 'next-themes';

export interface EChartsBaseProps {
  className?: string;
  style?: React.CSSProperties;
  getOption: (ctx: {
    isDark: boolean;
    width: number;
    height: number;
  }) => echarts.EChartsOption;
}

export function EChartsBase({ className, style, getOption }: EChartsBaseProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const chartRef = React.useRef<echarts.ECharts | null>(null);
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  React.useEffect(() => {
    if (!containerRef.current) return;
    const chart = echarts.init(containerRef.current, undefined, {
      renderer: 'canvas',
      locale: 'EN',
    });
    chartRef.current = chart;

    const resizeObserver = new ResizeObserver(() => {
      if (!chartRef.current || !containerRef.current) return;
      chartRef.current.resize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    if (!chartRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const option = getOption({
      isDark,
      width: rect.width,
      height: rect.height,
    });
    chartRef.current.setOption(option, true);
  }, [isDark, getOption]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', ...style }}
    />
  );
}

export default EChartsBase;
