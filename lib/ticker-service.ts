'use client';

import { TickData } from '@/types/kite';

// Lightweight browser WebSocket client for Kite streaming API
export class TickerService {
  private ws: WebSocket | null = null;
  private isConnected = false;
  private subscribers: Map<string, Set<(tick: TickData) => void>> = new Map();
  private desiredModes: Map<number, 'ltp' | 'quote' | 'full'> = new Map();

  constructor(private apiKey: string, private accessToken: string) {}

  connect() {
    if (typeof window === 'undefined') return; // only client-side
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;

    const url = `wss://ws.kite.trade?api_key=${encodeURIComponent(this.apiKey)}&access_token=${encodeURIComponent(this.accessToken)}`;
    this.ws = new WebSocket(url);

    this.ws.binaryType = 'arraybuffer';

    this.ws.onopen = () => {
      this.isConnected = true;
      // Resubscribe if we had prior intents
      const tokens = Array.from(this.desiredModes.keys());
      if (tokens.length > 0) {
        this.send({ a: 'subscribe', v: tokens });
        // group by mode
        const byMode: Record<'ltp' | 'quote' | 'full', number[]> = { ltp: [], quote: [], full: [] } as any;
        this.desiredModes.forEach((m, t) => { (byMode[m] as number[]).push(t); });
        (['ltp','quote','full'] as const).forEach((m) => {
          if (byMode[m].length) this.send({ a: 'mode', v: [m, byMode[m]] });
        });
      }
    };

    this.ws.onclose = () => {
      this.isConnected = false;
      // attempt a simple reconnect after small delay
      setTimeout(() => this.connect(), 1500);
    };

    this.ws.onerror = () => {
      // swallow; onclose will handle reconnect
    };

    this.ws.onmessage = (ev) => {
      if (typeof ev.data === 'string') {
        // text events: order updates, messages
        return; // not used here
      }

      const buf = ev.data as ArrayBuffer;
      if (!buf) return;
      const dv = new DataView(buf);

      let offset = 0;
      if (dv.byteLength < 2) return;
      const packets = dv.getInt16(offset, false); // big-endian
      offset += 2;

      for (let i = 0; i < packets; i++) {
        if (offset + 2 > dv.byteLength) break;
        const len = dv.getInt16(offset, false);
        offset += 2;
        if (offset + len > dv.byteLength) break;

        // Parse packet by length (ltp=8, quote=44). Index packets differ; treat like quote subset
        const token = dv.getInt32(offset + 0, false);
        let tick: TickData | null = null;
        if (len === 8) {
          // LTP
          const last = dv.getInt32(offset + 4, false) / 100.0;
          tick = { mode: 'ltp', instrument_token: token, last_price: last } as TickData;
        } else if (len >= 44) {
          const last_qty = dv.getInt32(offset + 8, false);
          const avg_price = dv.getInt32(offset + 12, false) / 100.0;
          const volume = dv.getInt32(offset + 16, false);
          const buy_qty = dv.getInt32(offset + 20, false);
          const sell_qty = dv.getInt32(offset + 24, false);
          const open = dv.getInt32(offset + 28, false) / 100.0;
          const high = dv.getInt32(offset + 32, false) / 100.0;
          const low = dv.getInt32(offset + 36, false) / 100.0;
          const close = dv.getInt32(offset + 40, false) / 100.0;
          const last = dv.getInt32(offset + 4, false) / 100.0;
          tick = {
            mode: 'quote',
            instrument_token: token,
            last_price: last,
            last_traded_quantity: last_qty,
            average_traded_price: avg_price,
            volume_traded: volume,
            total_buy_quantity: buy_qty,
            total_sell_quantity: sell_qty,
            open, high, low, close,
          } as TickData;
        }

        if (tick) {
          const callbacks = this.subscribers.get(token.toString());
          if (callbacks) callbacks.forEach((cb) => cb(tick!));
        }
        offset += len;
      }
    };
  }

  private send(payload: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(payload));
  }

  subscribe(tokens: number[], mode: 'ltp' | 'quote' | 'full' = 'quote') {
    tokens.forEach((t) => this.desiredModes.set(t, mode));
    this.connect();
    this.send({ a: 'subscribe', v: tokens });
    this.send({ a: 'mode', v: [mode, tokens] });
  }

  unsubscribe(tokens: number[]) {
    tokens.forEach((t) => this.desiredModes.delete(t));
    this.send({ a: 'unsubscribe', v: tokens });
  }

  onTick(token: number, callback: (tick: TickData) => void) {
    const tokenStr = token.toString();
    if (!this.subscribers.has(tokenStr)) this.subscribers.set(tokenStr, new Set());
    this.subscribers.get(tokenStr)!.add(callback);
    return () => {
      const set = this.subscribers.get(tokenStr);
      if (set) {
        set.delete(callback);
        if (set.size === 0) this.subscribers.delete(tokenStr);
      }
    };
  }

  disconnect() {
    if (this.ws) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }
    this.isConnected = false;
    this.subscribers.clear();
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}
