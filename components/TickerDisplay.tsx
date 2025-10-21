'use client';

import { useEffect, useState } from 'react';
import { useTicker } from '@/hooks/useTicker';
import { TickData } from '@/types/kite';

interface TickerDisplayProps {
  apiKey: string;
  accessToken: string;
  instruments: Array<{ token: number; name: string; exchange: string }>;
}

export default function TickerDisplay({ apiKey, accessToken, instruments }: TickerDisplayProps) {
  const { isConnected, subscribe, onTick } = useTicker(apiKey, accessToken);
  const [ticks, setTicks] = useState<Record<number, TickData>>({});

  useEffect(() => {
    if (isConnected && instruments.length > 0) {
      const tokens = instruments.map((i) => i.token);
      subscribe(tokens, 'full');

      const unsubscribers = tokens.map((token) =>
        onTick(token, (tick) => {
          setTicks((prev) => ({ ...prev, [token]: tick }));
        })
      );

      return () => {
        unsubscribers.forEach((unsub) => unsub());
      };
    }
  }, [isConnected, instruments]);

  const getInstrumentName = (token: number) => {
    const instrument = instruments.find((i) => i.token === token);
    return instrument ? `${instrument.exchange}:${instrument.name}` : token.toString();
  };

  const formatChange = (tick: TickData) => {
    if (!tick.close || !tick.last_price) return null;
    const change = tick.last_price - tick.close;
    const changePercent = ((change / tick.close) * 100).toFixed(2);
    return { change: change.toFixed(2), changePercent };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-4 border-b">
        <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm font-medium">
          {isConnected ? 'Live Market Data' : 'Connecting...'}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {instruments.map((instrument) => {
          const tick = ticks[instrument.token];
          const changeData = tick ? formatChange(tick) : null;

          return (
            <div
              key={instrument.token}
              className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{instrument.name}</h3>
                  <p className="text-xs text-gray-500">{instrument.exchange}</p>
                </div>
                {tick && changeData && (
                  <div
                    className={`text-right ${
                      parseFloat(changeData.change) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {parseFloat(changeData.change) >= 0 ? '+' : ''}
                      {changeData.change}
                    </div>
                    <div className="text-xs">
                      ({parseFloat(changeData.change) >= 0 ? '+' : ''}
                      {changeData.changePercent}%)
                    </div>
                  </div>
                )}
              </div>

              {tick ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">
                      ₹{tick.last_price?.toFixed(2) || 'N/A'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Open:</span>
                      <span className="ml-1 font-medium">₹{tick.open?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">High:</span>
                      <span className="ml-1 font-medium">₹{tick.high?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Low:</span>
                      <span className="ml-1 font-medium">₹{tick.low?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Close:</span>
                      <span className="ml-1 font-medium">₹{tick.close?.toFixed(2) || 'N/A'}</span>
                    </div>
                  </div>

                  {tick.volume_traded && (
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      Volume: {tick.volume_traded.toLocaleString()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-400 text-sm">Waiting for data...</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

