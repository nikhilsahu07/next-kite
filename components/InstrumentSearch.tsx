'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { POPULAR_STOCKS, POPULAR_INDEXES } from '@/lib/popular-instruments';

type Exchange = 'NSE' | 'BSE' | 'NFO' | 'CDS' | 'MCX' | 'BFO' | 'BFX' | 'INDICES';

export interface InstrumentOption {
  instrument_token: number;
  tradingsymbol: string;
  exchange: string;
  name?: string;
}

interface InstrumentSearchProps {
  label?: string;
  placeholder?: string;
  exchange?: Exchange | '';
  value?: string; // format: EXCHANGE:SYMBOL
  onChange: (value: string, meta?: InstrumentOption | null) => void;
  showPopular?: boolean;
}

export default function InstrumentSearch({
  label = 'Symbol',
  placeholder = 'Search stocks or indexes...',
  exchange = 'NSE',
  value,
  onChange,
  showPopular = true,
}: InstrumentSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<InstrumentOption[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keep input in sync with external value
  useEffect(() => {
    if (typeof value === 'string') {
      setQuery(value);
    } else {
      setQuery('');
    }
  }, [value]);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      if (!query || query.length < 1) {
        setResults([]);
        return;
      }
      try {
        const params = new URLSearchParams();
        params.set('q', query);
        if (exchange) params.set('exchange', exchange);
        params.set('limit', '15');
        const res = await fetch(`/api/instruments/search?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        setResults(data || []);
      } catch (_e) {}
    };
    const t = setTimeout(load, 150);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [query, exchange]);

  const popular = useMemo(() => {
    if (!showPopular) return [] as { label: string; value: string; exchange: string }[];
    return [...POPULAR_STOCKS.slice(0, 8), ...POPULAR_INDEXES.slice(0, 4)];
  }, [showPopular]);

  const select = (opt: { value?: string; exchange?: string } & Partial<InstrumentOption>) => {
    if (opt.tradingsymbol && opt.exchange) {
      const sel = `${opt.exchange}:${opt.tradingsymbol}`;
      setQuery(sel);
      onChange(sel, opt as InstrumentOption);
    } else if (opt.value && opt.exchange) {
      const sel = `${opt.exchange}:${opt.value}`;
      setQuery(sel);
      onChange(sel, null);
    }
    setOpen(false);
  };

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (!open) return;
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setHighlight((h) => Math.min(h + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setHighlight((h) => Math.max(h - 1, 0));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              const r = results[highlight];
              if (r) select(r);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-black/10 dark:border-white/20 rounded-md bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {open && (
          <div className="absolute z-20 mt-1 w-full bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-md shadow-lg max-h-80 overflow-auto">
            {query.length === 0 && popular.length > 0 && (
              <div className="p-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">Popular</div>
                <div className="grid grid-cols-2 gap-2 p-2">
                  {popular.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => select({ value: p.value, exchange: p.exchange })}
                      className="text-sm px-3 py-1 rounded border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-left"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {results.length > 0 && (
              <ul className="divide-y divide-black/5 dark:divide-white/5">
                {results.map((r, idx) => (
                  <li key={r.instrument_token}
                      className={`${idx === highlight ? 'bg-blue-50 dark:bg-blue-950/40' : ''} cursor-pointer px-3 py-2`}
                      onMouseEnter={() => setHighlight(idx)}
                      onClick={() => select(r)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm text-black dark:text-white">
                        {r.exchange}:{r.tradingsymbol}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{r.name}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {query.length > 0 && results.length === 0 && (
              <div className="p-3 text-sm text-gray-500 dark:text-gray-400">No matches</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


