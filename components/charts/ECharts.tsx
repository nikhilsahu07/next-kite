'use client';

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export type EChartOption = echarts.EChartsOption;

export interface EChartsProps {
  option: EChartOption;
  height?: number;
}

export default function ECharts({ option, height = 320 }: EChartsProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    chart.setOption(option);
    chartRef.current = chart;

    const resize = () => chart.resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      chart.dispose();
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(option, true);
  }, [option]);

  return <div ref={ref} style={{ width: '100%', height }} />;
}
