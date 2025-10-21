'use client';

import { useEffect, useState, useRef } from 'react';
import { Chart, ChartCanvas } from 'react-financial-charts';
import { XAxis, YAxis } from 'react-financial-charts';
import { CandlestickSeries } from 'react-financial-charts';
import { LineSeries } from 'react-financial-charts';
import { discontinuousTimeScaleProviderBuilder } from 'react-financial-charts';
import { OHLCTooltip } from 'react-financial-charts';
import { CrossHairCursor } from 'react-financial-charts';
import { MouseCoordinateX, MouseCoordinateY } from 'react-financial-charts';
import { EdgeIndicator } from 'react-financial-charts';
import { format } from 'd3-format';
import { timeFormat } from 'd3-time-format';

// Helper function to get the last element of an array
const last = <T,>(array: T[]): T => array[array.length - 1];

interface ChartData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  ma1?: number;
  ma2?: number;
}

interface FinancialChartInnerProps {
  data: ChartData[];
  height: number;
  showMA: boolean;
  ma1Period: number;
  ma2Period: number;
}

export default function FinancialChartInner({
  data,
  height,
  showMA,
  ma1Period,
  ma2Period,
}: FinancialChartInnerProps) {
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
    
    // Also update after a short delay to ensure container is rendered
    const timer = setTimeout(updateDimensions, 100);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(timer);
    };
  }, [height]);

  if (!data || data.length === 0) {
    return <div className="text-black/60 dark:text-white/60">No data available</div>;
  }

  const ScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
    (d: ChartData) => d.date
  );

  const { data: chartData, xScale, xAccessor, displayXAccessor } = ScaleProvider(data);
  const max = xAccessor(last(chartData));
  const min = xAccessor(chartData[Math.max(0, chartData.length - 150)]);
  const xExtents = [min, max + 5];

  const gridHeight = height - 50;
  const showGrid = true;
  const yExtents = (d: ChartData) => [d.high, d.low];
  
  const margin = { left: 10, right: 70, top: 10, bottom: 30 };
  
  // Theme colors
  const gridColor = isDark ? '#1f2937' : '#e5e7eb';
  const textColor = isDark ? '#d1d5db' : '#374151';
  const bgColor = isDark ? '#000000' : '#ffffff';

  // Formatters
  const priceFormat = format('.2f');
  const dateTimeFormat = timeFormat('%Y-%m-%d %H:%M');
  const dateFormat = timeFormat('%Y-%m-%d');

  return (
    <div ref={containerRef} className="w-full">
      <ChartCanvas
        height={height}
        ratio={1}
        width={dimensions.width}
        margin={margin}
        data={chartData}
        displayXAccessor={displayXAccessor}
        seriesName="NIFTY 50"
        xScale={xScale}
        xAccessor={xAccessor}
        xExtents={xExtents}
      >
        <Chart id={1} height={gridHeight} yExtents={yExtents}>
          <XAxis 
            showGridLines={showGrid} 
            gridLinesStrokeStyle={gridColor}
            strokeStyle={gridColor}
          />
          <YAxis 
            showGridLines={showGrid}
            gridLinesStrokeStyle={gridColor}
            strokeStyle={gridColor}
          />

          <CandlestickSeries
            fill={(d: ChartData) => (d.close > d.open ? '#22c55e' : '#ef4444')}
            stroke={(d: ChartData) => (d.close > d.open ? '#22c55e' : '#ef4444')}
            wickStroke={(d: ChartData) => (d.close > d.open ? '#22c55e' : '#ef4444')}
          />

          {showMA && (
            <>
              <LineSeries
                yAccessor={(d: ChartData) => d.ma1}
                strokeStyle="#3b82f6"
                strokeWidth={2}
              />
              <LineSeries
                yAccessor={(d: ChartData) => d.ma2}
                strokeStyle="#f59e0b"
                strokeWidth={2}
              />
            </>
          )}

          {/* Edge Indicator for current price */}
          <EdgeIndicator
            itemType="last"
            rectWidth={60}
            fill={(d: ChartData) => (d.close > d.open ? '#22c55e' : '#ef4444')}
            lineStroke={(d: ChartData) => (d.close > d.open ? '#22c55e' : '#ef4444')}
            displayFormat={priceFormat}
            yAccessor={(d: ChartData) => d.close}
          />

          {/* Mouse Coordinates */}
          <MouseCoordinateX
            rectWidth={100}
            displayFormat={dateFormat}
          />
          <MouseCoordinateY
            rectWidth={60}
            displayFormat={priceFormat}
          />

          {/* Tooltip with OHLC data */}
          <OHLCTooltip
            origin={[10, 10]}
            textFill={textColor}
            labelFill={textColor}
            ohlcFormat={priceFormat}
            displayTexts={{
              o: 'Open: ',
              h: ' High: ',
              l: ' Low: ',
              c: ' Close: ',
              na: 'N/A',
            }}
          />

          {/* Crosshair */}
          <CrossHairCursor 
            strokeStyle={isDark ? '#60a5fa' : '#3b82f6'}
          />
        </Chart>
      </ChartCanvas>
    </div>
  );
}

