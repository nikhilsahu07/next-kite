'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import TickerDisplay from '@/components/TickerDisplay';
import NiftyQuickAccess from '@/components/NiftyQuickAccess';
import { KiteProfile, Margins, Holding, Position } from '@/types/kite';

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<KiteProfile | null>(null);
  const [margins, setMargins] = useState<Margins | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Popular instruments for ticker display
  const instruments = [
    { token: 256265, name: 'RELIANCE', exchange: 'NSE' },
    { token: 738561, name: 'SBIN', exchange: 'NSE' },
    { token: 779521, name: 'TATAMOTORS', exchange: 'NSE' },
    { token: 408065, name: 'INFY', exchange: 'NSE' },
    { token: 2953217, name: 'TATASTEEL', exchange: 'NSE' },
    { token: 492033, name: 'HDFCBANK', exchange: 'NSE' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch profile
      const profileRes = await fetch('/api/profile');
      if (!profileRes.ok) {
        if (profileRes.status === 401) {
          router.push('/');
          return;
        }
        throw new Error('Failed to fetch profile');
      }
      const profileData = await profileRes.json();
      setProfile(profileData);

      // Fetch margins
      const marginsRes = await fetch('/api/margins');
      if (marginsRes.ok) {
        const marginsData = await marginsRes.json();
        setMargins(marginsData);
      }

      // Fetch holdings
      const holdingsRes = await fetch('/api/holdings');
      if (holdingsRes.ok) {
        const holdingsData = await holdingsRes.json();
        setHoldings(holdingsData);
      }

      // Fetch positions
      const positionsRes = await fetch('/api/positions');
      if (positionsRes.ok) {
        const positionsData = await positionsRes.json();
        setPositions(positionsData.net || []);
      }

      setLoading(false);
    } catch (err) {
      setError('Failed to load data');
      setLoading(false);
      console.error(err);
    }
  };

  // Calculate portfolio metrics
  const portfolioMetrics = useMemo(() => {
    const totalInvested = holdings.reduce((sum, h) => sum + (h.average_price * h.quantity), 0);
    const currentValue = holdings.reduce((sum, h) => sum + (h.last_price * h.quantity), 0);
    const totalPnL = holdings.reduce((sum, h) => sum + h.pnl, 0);
    const dayPnL = holdings.reduce((sum, h) => sum + h.day_change, 0);
    
    return {
      totalInvested,
      currentValue,
      totalPnL,
      totalPnLPercent: totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0,
      dayPnL,
      dayPnLPercent: currentValue > 0 ? (dayPnL / (currentValue - dayPnL)) * 100 : 0,
    };
  }, [holdings]);

  // Get top holdings for chart
  const topHoldings = useMemo(() => {
    return holdings
      .map(h => ({
        name: h.tradingsymbol,
        value: h.last_price * h.quantity,
        pnl: h.pnl,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [holdings]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading dashboard...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
            {error}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        {profile && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Welcome back, {profile.user_name}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {profile.user_id} • {profile.broker}
            </p>
          </div>
        )}

        {/* Portfolio Overview Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Investment</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              ₹{portfolioMetrics.totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Value</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              ₹{portfolioMetrics.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total P&L</div>
            <div className={`text-2xl font-bold ${portfolioMetrics.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolioMetrics.totalPnL >= 0 ? '+' : ''}₹{portfolioMetrics.totalPnL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
            <div className={`text-sm ${portfolioMetrics.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolioMetrics.totalPnLPercent >= 0 ? '+' : ''}{portfolioMetrics.totalPnLPercent.toFixed(2)}%
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Day's P&L</div>
            <div className={`text-2xl font-bold ${portfolioMetrics.dayPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolioMetrics.dayPnL >= 0 ? '+' : ''}₹{portfolioMetrics.dayPnL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
            <div className={`text-sm ${portfolioMetrics.dayPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolioMetrics.dayPnLPercent >= 0 ? '+' : ''}{portfolioMetrics.dayPnLPercent.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Top Holdings Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Holdings</h3>
            {topHoldings.length > 0 ? (
              <div className="space-y-3">
                {topHoldings.map((holding, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{holding.name}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ₹{holding.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gray-900 dark:bg-gray-100 h-2 rounded-full"
                        style={{
                          width: `${(holding.value / portfolioMetrics.currentValue) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-right mt-1">
                      <span className={holding.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {holding.pnl >= 0 ? '+' : ''}₹{holding.pnl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No holdings data available
              </div>
            )}
          </div>

          {/* Account Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Account Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Holdings</span>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{holdings.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Open Positions</span>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{positions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Profitable Holdings</span>
                <span className="text-xl font-bold text-green-600">
                  {holdings.filter(h => h.pnl > 0).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Loss-making Holdings</span>
                <span className="text-xl font-bold text-red-600">
                  {holdings.filter(h => h.pnl < 0).length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Margins Section */}
        {margins && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {margins.equity && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Equity Margins</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Net Available</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      ₹{margins.equity.net.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cash</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      ₹{margins.equity.available.cash.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Collateral</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      ₹{margins.equity.available.collateral.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Used Margin</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      ₹{margins.equity.utilised.debits.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  {/* Margin Usage Bar */}
                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Margin Usage</span>
                      <span>
                        {((margins.equity.utilised.debits / (margins.equity.net + margins.equity.utilised.debits)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gray-900 dark:bg-gray-100 h-2 rounded-full"
                        style={{
                          width: `${(margins.equity.utilised.debits / (margins.equity.net + margins.equity.utilised.debits)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {margins.commodity && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Commodity Margins</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Net Available</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      ₹{margins.commodity.net.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cash</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      ₹{margins.commodity.available.cash.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Collateral</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      ₹{margins.commodity.available.collateral.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Used Margin</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      ₹{margins.commodity.utilised.debits.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  {/* Margin Usage Bar */}
                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Margin Usage</span>
                      <span>
                        {((margins.commodity.utilised.debits / (margins.commodity.net + margins.commodity.utilised.debits)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gray-900 dark:bg-gray-100 h-2 rounded-full"
                        style={{
                          width: `${(margins.commodity.utilised.debits / (margins.commodity.net + margins.commodity.utilised.debits)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Nifty 50 Quick Access */}
        <div className="mb-8">
          <NiftyQuickAccess />
        </div>

        {/* Live Market Data */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Live Market Data</h3>
          <TickerDisplay
            apiKey={process.env.NEXT_PUBLIC_KITE_API_KEY || ''}
            accessToken={''} // This will need to be fetched from cookie in production
            instruments={instruments}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6">
          <a
            href="/positions"
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
          >
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Positions</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">View your open positions</p>
          </a>

          <a
            href="/holdings"
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
          >
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Holdings</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Check your holdings</p>
          </a>

          <a
            href="/orders"
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
          >
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Orders</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Place and manage orders</p>
          </a>

          <a
            href="/watchlist"
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
          >
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Watchlist</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Track favorite stocks</p>
          </a>
        </div>
      </div>
    </MainLayout>
  );
}
