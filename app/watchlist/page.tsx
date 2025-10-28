'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import InstrumentSearch from '@/components/InstrumentSearch';

interface WatchItem {
  key: string; // EXCHANGE:SYMBOL
}

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchItem[]>([]);
  const [selected, setSelected] = useState<string>('');

  useEffect(() => {
    const raw = localStorage.getItem('watchlist');
    if (raw) setItems(JSON.parse(raw));
  }, []);

  const persist = (list: WatchItem[]) => {
    setItems(list);
    localStorage.setItem('watchlist', JSON.stringify(list));
  };

  const add = () => {
    if (!selected) return;
    if (items.some((i) => i.key === selected)) return;
    persist([{ key: selected }, ...items]);
    setSelected('');
  };

  const remove = (key: string) => {
    persist(items.filter((i) => i.key !== key));
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Watchlist</h1>
        </div>

        <div className="rounded-lg border border-black/10 dark:border-white/10 p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <InstrumentSearch
                label="Add symbol"
                exchange="NSE"
                value={selected}
                onChange={(val) => setSelected(val)}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={add}
                className="border border-black/10 dark:border-white/20 px-4 py-2 rounded-md"
              >
                Add to Watchlist
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-black/10 dark:border-white/10 p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                <th className="text-left px-4 py-2">Symbol</th>
                <th className="text-left px-4 py-2">Exchange</th>
                <th className="text-right px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td className="px-4 py-4" colSpan={3}>No items yet</td>
                </tr>
              )}
              {items.map((i) => {
                const [ex, sym] = i.key.split(':');
                return (
                  <tr key={i.key} className="border-b border-black/5 dark:border-white/5">
                    <td className="px-4 py-2 font-medium">{sym}</td>
                    <td className="px-4 py-2">{ex}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => remove(i.key)}
                        className="border border-black/10 dark:border-white/20 px-3 py-1 rounded-md"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
