'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import TickerDisplay from '@/components/TickerDisplay';
import NiftyQuickAccess from '@/components/NiftyQuickAccess';
import { KiteProfile, Margins } from '@/types/kite';

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<KiteProfile | null>(null);
  const [margins, setMargins] = useState<Margins | null>(null);
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

      setLoading(false);
    } catch (err) {
      setError('Failed to load data');
      setLoading(false);
      console.error(err);
    }
  };

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
        {/* Profile Section */}
        {profile && (
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">
              Welcome, {profile.user_name}!
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-black/60 dark:text-white/60">
                  User ID:
                </span>
                <p className="font-medium">{profile.user_id}</p>
              </div>
              <div>
                <span className="text-black/60 dark:text-white/60">Email:</span>
                <p className="font-medium">{profile.email}</p>
              </div>
              <div>
                <span className="text-black/60 dark:text-white/60">
                  Broker:
                </span>
                <p className="font-medium">{profile.broker}</p>
              </div>
              <div>
                <span className="text-black/60 dark:text-white/60">
                  User Type:
                </span>
                <p className="font-medium">{profile.user_type}</p>
              </div>
            </div>
          </div>
        )}

        {/* Margins Section */}
        {margins && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {margins.equity && (
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                <h3 className="text-xl font-semibold mb-4">Equity Margins</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-black/60 dark:text-white/60">
                      Net Available:
                    </span>
                    <span className="font-bold">
                      ₹
                      {margins.equity.net.toLocaleString('en-IN', {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60 dark:text-white/60">
                      Cash:
                    </span>
                    <span className="font-medium">
                      ₹
                      {margins.equity.available.cash.toLocaleString('en-IN', {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60 dark:text-white/60">
                      Collateral:
                    </span>
                    <span className="font-medium">
                      ₹
                      {margins.equity.available.collateral.toLocaleString(
                        'en-IN',
                        { maximumFractionDigits: 2 }
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-black/10 dark:border-white/10">
                    <span className="text-black/60 dark:text-white/60">
                      Used Margin:
                    </span>
                    <span className="font-medium">
                      ₹
                      {margins.equity.utilised.debits.toLocaleString('en-IN', {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {margins.commodity && (
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Commodity Margins
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-black/60 dark:text-white/60">
                      Net Available:
                    </span>
                    <span className="font-bold">
                      ₹
                      {margins.commodity.net.toLocaleString('en-IN', {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60 dark:text-white/60">
                      Cash:
                    </span>
                    <span className="font-medium">
                      ₹
                      {margins.commodity.available.cash.toLocaleString(
                        'en-IN',
                        { maximumFractionDigits: 2 }
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60 dark:text-white/60">
                      Collateral:
                    </span>
                    <span className="font-medium">
                      ₹
                      {margins.commodity.available.collateral.toLocaleString(
                        'en-IN',
                        { maximumFractionDigits: 2 }
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-black/10 dark:border-white/10">
                    <span className="text-black/60 dark:text-white/60">
                      Used Margin:
                    </span>
                    <span className="font-medium">
                      ₹
                      {margins.commodity.utilised.debits.toLocaleString(
                        'en-IN',
                        { maximumFractionDigits: 2 }
                      )}
                    </span>
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
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
          <h3 className="text-xl font-semibold mb-6">Live Market Data</h3>
          <TickerDisplay
            apiKey={process.env.NEXT_PUBLIC_KITE_API_KEY || ''}
            accessToken={''} // This will need to be fetched from cookie in production
            instruments={instruments}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
            <h4 className="text-lg font-semibold mb-2">Quick Actions</h4>
            <ul className="space-y-2 text-sm">
              <li>• View your positions</li>
              <li>• Check holdings</li>
              <li>• Place new orders</li>
            </ul>
          </div>

          <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
            <h4 className="text-lg font-semibold mb-2">Market Status</h4>
            <p className="text-sm">
              Real-time WebSocket connection for live market updates
            </p>
          </div>

          <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
            <h4 className="text-lg font-semibold mb-2">Account Info</h4>
            <p className="text-sm">
              {profile?.exchanges.join(', ')} segments enabled
            </p>
          </div>

          <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
            <h4 className="text-lg font-semibold mb-2">Watchlist</h4>
            <p className="text-sm mb-3">
              Track your favorite stocks and indexes
            </p>
            <a href="/watchlist" className="underline">
              Manage Watchlist
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
