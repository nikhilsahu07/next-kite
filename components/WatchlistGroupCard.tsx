'use client';

import { useState } from 'react';
import { WatchlistGroup } from '@/lib/watchlist-service';

interface WatchlistGroupCardProps {
  watchlist: WatchlistGroup;
  onDelete: (watchlistId: string) => void;
  onUpdatePrices: (watchlistId: string) => void;
  onRemoveItem: (watchlistId: string, itemId: string) => void;
}

export default function WatchlistGroupCard({
  watchlist,
  onDelete,
  onUpdatePrices,
  onRemoveItem,
}: WatchlistGroupCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleRemoveItem = (itemId: string) => {
    onRemoveItem(watchlist.id, itemId);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className={`w-5 h-5 transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            <h3 className="text-lg font-semibold text-gray-800">
              {watchlist.name}
            </h3>
            <span className="text-sm text-gray-500">
              ({watchlist.items.length} items)
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onUpdatePrices(watchlist.id)}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Update Prices
            </button>
            {watchlist.id !== 'default' && (
              <button
                onClick={() => onDelete(watchlist.id)}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          {watchlist.items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-gray-400 mb-2">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <p>No items in this watchlist</p>
              <p className="text-sm">Add stocks or indexes to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {watchlist.items.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {item.symbol}
                      </h4>
                      <p className="text-sm text-gray-600">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.exchange}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {item.lastPrice && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">LTP:</span>
                        <span className="font-semibold">
                          ₹{item.lastPrice.toFixed(2)}
                        </span>
                      </div>
                      {item.change !== undefined &&
                        item.changePercent !== undefined && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Change:
                            </span>
                            <span
                              className={`text-sm ${
                                item.change >= 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {item.change >= 0 ? '+' : ''}₹
                              {item.change.toFixed(2)} (
                              {item.changePercent.toFixed(2)}%)
                            </span>
                          </div>
                        )}
                    </div>
                  )}

                  {!item.lastPrice && (
                    <div className="text-center py-2 text-gray-500">
                      <p className="text-xs">No price data</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
