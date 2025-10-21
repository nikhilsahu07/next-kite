'use client';

import { useEffect, useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import FinancialCandlestickChart from '@/components/charts/FinancialCandlestickChart';

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface Statistics {
  totalCandles: number;
  firstDate: string;
  lastDate: string;
  currentPrice: number;
  highestPrice: number;
  lowestPrice: number;
  priceChange: number;
  priceChangePercent: number;
  avgVolatility: number;
  yearlyReturn: number;
}

export default function NiftyPage() {
  const [rawData, setRawData] = useState<CandleData[]>([]);
  const [filteredData, setFilteredData] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState('all');
  const [aggregation, setAggregation] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [showMA, setShowMA] = useState(true);
  const [ma1Period, setMa1Period] = useState(20);
  const [ma2Period, setMa2Period] = useState(50);

  // Parse CSV data (no header row in this file)
  const parseCSV = (csvText: string): CandleData[] => {
    const lines = csvText.trim().split('\n');
    const data: CandleData[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',');
      if (values.length < 5) continue;

      try {
        const candle: CandleData = {
          time: values[0].split('+')[0], // Remove timezone part
          open: parseFloat(values[1]),
          high: parseFloat(values[2]),
          low: parseFloat(values[3]),
          close: parseFloat(values[4]),
        };

        if (!isNaN(candle.open) && !isNaN(candle.high) && 
            !isNaN(candle.low) && !isNaN(candle.close)) {
          data.push(candle);
        }
      } catch (e) {
        console.error('Error parsing line:', line, e);
      }
    }

    console.log(`Parsed ${data.length} candles from CSV`);
    console.log('First candle:', data[0]);
    console.log('Last candle:', data[data.length - 1]);
    return data;
  };

  // Load CSV file
  useEffect(() => {
    const loadCSV = async () => {
      try {
        setLoading(true);
        const response = await fetch('/nifty.csv');
        if (!response.ok) {
          throw new Error('Failed to load CSV file');
        }
        const csvText = await response.text();
        const parsed = parseCSV(csvText);
        setRawData(parsed);
        setFilteredData(parsed);
        setError('');
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
        console.error('Error loading CSV:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCSV();
  }, []);

  // Aggregate data by period
  const aggregateData = (data: CandleData[], period: 'daily' | 'monthly' | 'yearly'): CandleData[] => {
    if (period === 'daily') return data;
    
    const grouped = new Map<string, CandleData[]>();
    
    data.forEach(candle => {
      const date = new Date(candle.time);
      let key: string;
      
      if (period === 'monthly') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        key = `${date.getFullYear()}`;
      }
      
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(candle);
    });
    
    const aggregated: CandleData[] = [];
    
    grouped.forEach((candles, key) => {
      if (candles.length === 0) return;
      
      const first = candles[0];
      const last = candles[candles.length - 1];
      const high = Math.max(...candles.map(c => c.high));
      const low = Math.min(...candles.map(c => c.low));
      
      aggregated.push({
        time: last.time, // Use last date of period
        open: first.open,
        high: high,
        low: low,
        close: last.close,
      });
    });
    
    return aggregated.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  };

  // Filter data by timeframe and aggregate
  useEffect(() => {
    if (rawData.length === 0) return;

    const now = new Date();
    let filtered = rawData;

    switch (timeframe) {
      case '1M':
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
        filtered = rawData.filter(d => new Date(d.time) >= oneMonthAgo);
        break;
      case '3M':
        const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
        filtered = rawData.filter(d => new Date(d.time) >= threeMonthsAgo);
        break;
      case '6M':
        const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
        filtered = rawData.filter(d => new Date(d.time) >= sixMonthsAgo);
        break;
      case '1Y':
        const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
        filtered = rawData.filter(d => new Date(d.time) >= oneYearAgo);
        break;
      case '5Y':
        const fiveYearsAgo = new Date(now.setFullYear(now.getFullYear() - 5));
        filtered = rawData.filter(d => new Date(d.time) >= fiveYearsAgo);
        break;
      case 'all':
      default:
        filtered = rawData;
    }

    // Apply aggregation
    const aggregatedData = aggregateData(filtered, aggregation);
    setFilteredData(aggregatedData);
  }, [timeframe, rawData, aggregation]);

  // Calculate statistics
  const statistics = useMemo((): Statistics | null => {
    if (filteredData.length === 0) return null;

    const first = filteredData[0];
    const last = filteredData[filteredData.length - 1];
    
    const highest = Math.max(...filteredData.map(d => d.high));
    const lowest = Math.min(...filteredData.map(d => d.low));
    
    const priceChange = last.close - first.open;
    const priceChangePercent = (priceChange / first.open) * 100;

    // Calculate average daily volatility
    let totalVolatility = 0;
    for (const candle of filteredData) {
      const dailyRange = ((candle.high - candle.low) / candle.close) * 100;
      totalVolatility += dailyRange;
    }
    const avgVolatility = totalVolatility / filteredData.length;

    // Calculate yearly return
    const firstDate = new Date(first.time);
    const lastDate = new Date(last.time);
    const years = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    const yearlyReturn = years > 0 ? (Math.pow(last.close / first.open, 1 / years) - 1) * 100 : 0;

    return {
      totalCandles: filteredData.length,
      firstDate: first.time,
      lastDate: last.time,
      currentPrice: last.close,
      highestPrice: highest,
      lowestPrice: lowest,
      priceChange,
      priceChangePercent,
      avgVolatility,
      yearlyReturn,
    };
  }, [filteredData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-black/60 dark:text-white/60">Loading Nifty 50 Historical Data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="border border-red-500 rounded-lg p-6 bg-red-50 dark:bg-red-950/20">
            <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Data</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Nifty 50 Historical Analysis
          </h1>
          <p className="text-black/60 dark:text-white/60">
            Comprehensive technical analysis and historical data visualization
          </p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div className="border border-black/10 dark:border-white/10 rounded-lg p-4 bg-white dark:bg-black">
              <div className="text-xs text-black/60 dark:text-white/60 mb-1">Current Price</div>
              <div className="text-2xl font-bold">
                {statistics.currentPrice.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>

            <div className="border border-black/10 dark:border-white/10 rounded-lg p-4 bg-white dark:bg-black">
              <div className="text-xs text-black/60 dark:text-white/60 mb-1">Change</div>
              <div className={`text-2xl font-bold ${statistics.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {statistics.priceChange >= 0 ? '+' : ''}
                {statistics.priceChangePercent.toFixed(2)}%
              </div>
            </div>

            <div className="border border-black/10 dark:border-white/10 rounded-lg p-4 bg-white dark:bg-black">
              <div className="text-xs text-black/60 dark:text-white/60 mb-1">Period High</div>
              <div className="text-2xl font-bold text-green-600">
                {statistics.highestPrice.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>

            <div className="border border-black/10 dark:border-white/10 rounded-lg p-4 bg-white dark:bg-black">
              <div className="text-xs text-black/60 dark:text-white/60 mb-1">Period Low</div>
              <div className="text-2xl font-bold text-red-600">
                {statistics.lowestPrice.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>

            <div className="border border-black/10 dark:border-white/10 rounded-lg p-4 bg-white dark:bg-black">
              <div className="text-xs text-black/60 dark:text-white/60 mb-1">Avg Volatility</div>
              <div className="text-2xl font-bold text-blue-600">
                {statistics.avgVolatility.toFixed(2)}%
              </div>
            </div>

            <div className="border border-black/10 dark:border-white/10 rounded-lg p-4 bg-white dark:bg-black">
              <div className="text-xs text-black/60 dark:text-white/60 mb-1">Yearly Return</div>
              <div className={`text-2xl font-bold ${statistics.yearlyReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {statistics.yearlyReturn >= 0 ? '+' : ''}
                {statistics.yearlyReturn.toFixed(2)}%
              </div>
            </div>
          </div>
        )}

        {/* Chart Controls */}
        <div className="border border-black/10 dark:border-white/10 rounded-lg p-4 mb-6 bg-white dark:bg-black">
          <div className="flex flex-wrap items-center gap-4">
            {/* Timeframe Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Timeframe:</span>
              <div className="flex gap-1">
                {['1M', '3M', '6M', '1Y', '5Y', 'all'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                      timeframe === tf
                        ? 'bg-blue-600 text-white'
                        : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                    }`}
                  >
                    {tf === 'all' ? 'ALL' : tf}
                  </button>
                ))}
              </div>
            </div>

            {/* MA Toggle */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showMA}
                  onChange={(e) => setShowMA(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Moving Averages</span>
              </label>
            </div>

            {/* MA Period Inputs */}
            {showMA && (
              <>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">MA1:</label>
                  <input
                    type="number"
                    value={ma1Period}
                    onChange={(e) => setMa1Period(parseInt(e.target.value) || 20)}
                    className="w-16 px-2 py-1 border border-black/10 dark:border-white/10 rounded bg-transparent text-sm"
                    min="1"
                    max="200"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">MA2:</label>
                  <input
                    type="number"
                    value={ma2Period}
                    onChange={(e) => setMa2Period(parseInt(e.target.value) || 50)}
                    className="w-16 px-2 py-1 border border-black/10 dark:border-white/10 rounded bg-transparent text-sm"
                    min="1"
                    max="200"
                  />
                </div>
              </>
            )}

            {/* Data Count */}
            <div className="ml-auto text-sm text-black/60 dark:text-white/60">
              {filteredData.length.toLocaleString()} candles
            </div>
          </div>
        </div>

        {/* Data Info */}
        <div className="mb-4 p-4 border border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-950/20">
          <p className="text-sm font-medium">
            📊 Data Loaded: {filteredData.length} candles | 
            First: {filteredData[0]?.time} | 
            Last: {filteredData[filteredData.length - 1]?.time}
          </p>
          <p className="text-xs text-black/60 dark:text-white/60 mt-1">
            Sample: Open={filteredData[0]?.open}, High={filteredData[0]?.high}, Low={filteredData[0]?.low}, Close={filteredData[0]?.close}
          </p>
        </div>

        {/* Main Chart */}
        <div className="mb-6 border border-black/10 dark:border-white/10 rounded-lg p-4 bg-white dark:bg-black">
          <h3 className="text-lg font-semibold mb-4">Candlestick Chart ({filteredData.length} candles)</h3>
          <FinancialCandlestickChart
            data={filteredData}
            height={600}
            showMA={showMA}
            ma1Period={ma1Period}
            ma2Period={ma2Period}
          />
        </div>

        {/* Additional Statistics */}
        {statistics && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="border border-black/10 dark:border-white/10 rounded-lg p-6 bg-white dark:bg-black">
              <h3 className="text-xl font-bold mb-4">Period Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-black/60 dark:text-white/60">Start Date:</span>
                  <span className="font-medium">
                    {new Date(statistics.firstDate).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/60 dark:text-white/60">End Date:</span>
                  <span className="font-medium">
                    {new Date(statistics.lastDate).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/60 dark:text-white/60">Total Trading Days:</span>
                  <span className="font-medium">{statistics.totalCandles}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/60 dark:text-white/60">Price Range:</span>
                  <span className="font-medium">
                    {((statistics.highestPrice - statistics.lowestPrice) / statistics.lowestPrice * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-black/10 dark:border-white/10 rounded-lg p-6 bg-white dark:bg-black">
              <h3 className="text-xl font-bold mb-4">Performance Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-black/60 dark:text-white/60">Absolute Change:</span>
                  <span className={`font-medium ${statistics.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {statistics.priceChange >= 0 ? '+' : ''}
                    {statistics.priceChange.toFixed(2)} points
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/60 dark:text-white/60">Percentage Change:</span>
                  <span className={`font-medium ${statistics.priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {statistics.priceChangePercent >= 0 ? '+' : ''}
                    {statistics.priceChangePercent.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/60 dark:text-white/60">Annualized Return:</span>
                  <span className={`font-medium ${statistics.yearlyReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {statistics.yearlyReturn >= 0 ? '+' : ''}
                    {statistics.yearlyReturn.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/60 dark:text-white/60">Average Daily Volatility:</span>
                  <span className="font-medium text-blue-600">
                    {statistics.avgVolatility.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Table (Last 10 records) */}
        <div className="border border-black/10 dark:border-white/10 rounded-lg p-6 bg-white dark:bg-black">
          <h3 className="text-xl font-bold mb-4">Recent Data (Last 10 Days)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="text-left py-2 px-3 font-semibold">Date</th>
                  <th className="text-right py-2 px-3 font-semibold">Open</th>
                  <th className="text-right py-2 px-3 font-semibold">High</th>
                  <th className="text-right py-2 px-3 font-semibold">Low</th>
                  <th className="text-right py-2 px-3 font-semibold">Close</th>
                  <th className="text-right py-2 px-3 font-semibold">Change %</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(-10).reverse().map((candle, index) => {
                  const change = ((candle.close - candle.open) / candle.open) * 100;
                  return (
                    <tr key={index} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5">
                      <td className="py-2 px-3">
                        {new Date(candle.time).toLocaleDateString('en-IN')}
                      </td>
                      <td className="text-right py-2 px-3">{candle.open.toFixed(2)}</td>
                      <td className="text-right py-2 px-3 text-green-600">{candle.high.toFixed(2)}</td>
                      <td className="text-right py-2 px-3 text-red-600">{candle.low.toFixed(2)}</td>
                      <td className="text-right py-2 px-3 font-medium">{candle.close.toFixed(2)}</td>
                      <td className={`text-right py-2 px-3 font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

