'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { KiteProfile, Margins, Holding, Position } from '@/types/kite';

export default function AccountsPage() {
  const [profile, setProfile] = useState<KiteProfile | null>(null);
  const [margins, setMargins] = useState<Margins | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAccountData();
  }, []);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch profile
      const profileRes = await fetch('/api/profile');
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }

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
      setError('Failed to fetch account data');
      setLoading(false);
      console.error(err);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">
              Loading account details...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Account Overview
          </h1>
          <p className="text-gray-600">
            View your account details, margins, holdings, and positions.
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          {profile && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">
                Profile Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-gray-500 text-sm">Name:</span>
                  <p className="font-medium">{profile.user_name}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">User ID:</span>
                  <p className="font-medium">{profile.user_id}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Email:</span>
                  <p className="font-medium">{profile.email}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Broker:</span>
                  <p className="font-medium">{profile.broker}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">User Type:</span>
                  <p className="font-medium">{profile.user_type}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Exchanges:</span>
                  <p className="font-medium">{profile.exchanges.join(', ')}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Products:</span>
                  <p className="font-medium">{profile.products.join(', ')}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Order Types:</span>
                  <p className="font-medium">
                    {profile.order_types.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Margins */}
          {margins && (
            <div className="grid md:grid-cols-2 gap-6">
              {margins.equity && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-4">Equity Margins</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Net Available:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(margins.equity.net)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cash:</span>
                      <span className="font-medium">
                        {formatCurrency(margins.equity.available.cash)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Collateral:</span>
                      <span className="font-medium">
                        {formatCurrency(margins.equity.available.collateral)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-gray-600">Used Margin:</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(margins.equity.utilised.debits)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {margins.commodity && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Commodity Margins
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Net Available:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(margins.commodity.net)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cash:</span>
                      <span className="font-medium">
                        {formatCurrency(margins.commodity.available.cash)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Collateral:</span>
                      <span className="font-medium">
                        {formatCurrency(margins.commodity.available.collateral)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-gray-600">Used Margin:</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(margins.commodity.utilised.debits)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Holdings */}
          {holdings.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">
                Holdings ({holdings.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Symbol</th>
                      <th className="text-left py-2">Exchange</th>
                      <th className="text-right py-2">Quantity</th>
                      <th className="text-right py-2">Avg Price</th>
                      <th className="text-right py-2">LTP</th>
                      <th className="text-right py-2">P&L</th>
                      <th className="text-right py-2">P&L %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((holding, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 font-medium">
                          {holding.tradingsymbol}
                        </td>
                        <td className="py-2 text-gray-600">
                          {holding.exchange}
                        </td>
                        <td className="py-2 text-right">{holding.quantity}</td>
                        <td className="py-2 text-right">
                          {formatCurrency(holding.average_price)}
                        </td>
                        <td className="py-2 text-right">
                          {formatCurrency(holding.last_price)}
                        </td>
                        <td
                          className={`py-2 text-right ${
                            holding.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(holding.pnl)}
                        </td>
                        <td
                          className={`py-2 text-right ${
                            holding.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {formatPercentage(holding.pnl)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Positions */}
          {positions.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">
                Open Positions ({positions.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Symbol</th>
                      <th className="text-left py-2">Exchange</th>
                      <th className="text-right py-2">Quantity</th>
                      <th className="text-right py-2">Avg Price</th>
                      <th className="text-right py-2">LTP</th>
                      <th className="text-right py-2">P&L</th>
                      <th className="text-right py-2">P&L %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((position, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 font-medium">
                          {position.tradingsymbol}
                        </td>
                        <td className="py-2 text-gray-600">
                          {position.exchange}
                        </td>
                        <td className="py-2 text-right">{position.quantity}</td>
                        <td className="py-2 text-right">
                          {formatCurrency(position.average_price)}
                        </td>
                        <td className="py-2 text-right">
                          {formatCurrency(position.last_price)}
                        </td>
                        <td
                          className={`py-2 text-right ${
                            position.pnl >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(position.pnl)}
                        </td>
                        <td
                          className={`py-2 text-right ${
                            position.pnl >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {formatPercentage(position.pnl)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* No Data Message */}
          {!profile &&
            !margins &&
            holdings.length === 0 &&
            positions.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-600">
                  No account data available. Please authenticate your account to
                  view details.
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
