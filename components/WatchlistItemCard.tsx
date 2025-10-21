'use client';

import { useState, useEffect } from 'react';
import { WatchlistItem, WatchlistGroup } from '@/lib/watchlist-service';

interface WatchlistItemCardProps {
  item: WatchlistItem;
  onRemove: (itemId: string) => void;
}

export default function WatchlistItemCard({
  item,
  onRemove,
}: WatchlistItemCardProps) {
  const formatPrice = (price: number) => {
    return `₹${price.toFixed(2)}`;
  };

  const formatChange = (change: number, changePercent: number) => {
    const isPositive = change >= 0;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    return (
      <span className={color}>
        {isPositive ? '+' : ''}
        {formatPrice(change)} ({changePercent.toFixed(2)}%)
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold text-gray-800">{item.symbol}</h4>
          <p className="text-sm text-gray-600">{item.name}</p>
          <p className="text-xs text-gray-500">{item.exchange}</p>
        </div>
        <button
          onClick={() => onRemove(item.id)}
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
            <span className="font-semibold">{formatPrice(item.lastPrice)}</span>
          </div>
          {item.change !== undefined && item.changePercent !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Change:</span>
              {formatChange(item.change, item.changePercent)}
            </div>
          )}
          {item.volume && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Volume:</span>
              <span className="text-sm">{item.volume.toLocaleString()}</span>
            </div>
          )}
          {item.ohlc && (
            <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <span className="text-gray-400">O:</span>{' '}
                  {formatPrice(item.ohlc.open)}
                </div>
                <div>
                  <span className="text-gray-400">H:</span>{' '}
                  {formatPrice(item.ohlc.high)}
                </div>
                <div>
                  <span className="text-gray-400">L:</span>{' '}
                  {formatPrice(item.ohlc.low)}
                </div>
                <div>
                  <span className="text-gray-400">C:</span>{' '}
                  {formatPrice(item.ohlc.close)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!item.lastPrice && (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">Click "Update Prices" to load current data</p>
        </div>
      )}
    </div>
  );
}
