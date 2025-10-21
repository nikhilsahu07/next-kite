'use client';

import { useEffect, useRef, useState } from 'react';
import { TickerService } from '@/lib/ticker-service';
import { TickData } from '@/types/kite';

export function useTicker(apiKey: string, accessToken: string) {
  const tickerRef = useRef<TickerService | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!apiKey || !accessToken) return;

    tickerRef.current = new TickerService(apiKey, accessToken);
    tickerRef.current.connect();

    const checkConnection = setInterval(() => {
      if (tickerRef.current) {
        setIsConnected(tickerRef.current.getConnectionStatus());
      }
    }, 1000);

    return () => {
      clearInterval(checkConnection);
      if (tickerRef.current) {
        tickerRef.current.disconnect();
        tickerRef.current = null;
      }
    };
  }, [apiKey, accessToken]);

  const subscribe = (tokens: number[], mode: 'ltp' | 'quote' | 'full' = 'full') => {
    if (tickerRef.current) {
      tickerRef.current.subscribe(tokens, mode);
    }
  };

  const unsubscribe = (tokens: number[]) => {
    if (tickerRef.current) {
      tickerRef.current.unsubscribe(tokens);
    }
  };

  const onTick = (token: number, callback: (tick: TickData) => void) => {
    if (tickerRef.current) {
      return tickerRef.current.onTick(token, callback);
    }
    return () => {};
  };

  return {
    isConnected,
    subscribe,
    unsubscribe,
    onTick,
  };
}

