'use client';

import { useState } from 'react';

interface AddToWatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (watchlistId: string, item: any) => void;
  watchlists: Array<{ id: string; name: string }>;
  searchResults: any[];
  isLoading: boolean;
}

export default function AddToWatchlistModal({
  isOpen,
  onClose,
  onAdd,
  watchlists,
  searchResults,
  isLoading,
}: AddToWatchlistModalProps) {
  const [selectedWatchlist, setSelectedWatchlist] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (selectedWatchlist && selectedItem) {
      const item = {
        symbol: selectedItem.tradingsymbol,
        name: selectedItem.name,
        exchange: selectedItem.exchange,
        instrumentToken: selectedItem.instrument_token,
      };
      onAdd(selectedWatchlist, item);
      onClose();
      setSelectedWatchlist('');
      setSelectedItem(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Add to Watchlist</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
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
        </div>

        <div className="p-6 space-y-6">
          {/* Watchlist Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Watchlist
            </label>
            <select
              value={selectedWatchlist}
              onChange={(e) => setSelectedWatchlist(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a watchlist</option>
              {watchlists.map((watchlist) => (
                <option key={watchlist.id} value={watchlist.id}>
                  {watchlist.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Results */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Instrument
            </label>
            <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  Searching...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No instruments found
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedItem(item)}
                      className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                        selectedItem?.instrument_token === item.instrument_token
                          ? 'bg-blue-50 border-l-4 border-blue-500'
                          : ''
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-800">
                            {item.tradingsymbol}
                          </div>
                          <div className="text-sm text-gray-600">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.exchange} • {item.instrument_type}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          Token: {item.instrument_token}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Item Preview */}
          {selectedItem && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Selected Item</h4>
              <div className="text-sm text-gray-600">
                <div>
                  <strong>Symbol:</strong> {selectedItem.tradingsymbol}
                </div>
                <div>
                  <strong>Name:</strong> {selectedItem.name}
                </div>
                <div>
                  <strong>Exchange:</strong> {selectedItem.exchange}
                </div>
                <div>
                  <strong>Type:</strong> {selectedItem.instrument_type}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedWatchlist || !selectedItem}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Add to Watchlist
          </button>
        </div>
      </div>
    </div>
  );
}
