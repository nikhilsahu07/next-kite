'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';

interface OrderInput {
  exchange: string;
  tradingsymbol: string;
  transaction_type: 'BUY' | 'SELL';
  variety: string;
  product: string;
  order_type: string;
  quantity: number;
  price: number;
  trigger_price: number;
}

export default function MarginsPage() {
  const [orders, setOrders] = useState<OrderInput[]>([{
    exchange: 'NSE',
    tradingsymbol: '',
    transaction_type: 'BUY',
    variety: 'regular',
    product: 'CNC',
    order_type: 'MARKET',
    quantity: 1,
    price: 0,
    trigger_price: 0,
  }]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [calculationType, setCalculationType] = useState<'orders' | 'basket' | 'charges'>('orders');

  const addOrder = () => {
    setOrders([...orders, {
      exchange: 'NSE',
      tradingsymbol: '',
      transaction_type: 'BUY',
      variety: 'regular',
      product: 'CNC',
      order_type: 'MARKET',
      quantity: 1,
      price: 0,
      trigger_price: 0,
    }]);
  };

  const updateOrder = (index: number, field: keyof OrderInput, value: any) => {
    const updated = [...orders];
    updated[index] = { ...updated[index], [field]: value };
    setOrders(updated);
  };

  const removeOrder = (index: number) => {
    setOrders(orders.filter((_, i) => i !== index));
  };

  const calculate = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      let url = '';
      if (calculationType === 'orders') {
        url = '/api/margins/orders';
      } else if (calculationType === 'basket') {
        url = '/api/margins/basket?consider_positions=true';
      } else {
        url = '/api/charges/orders';
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orders),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to calculate');
      }

      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setError(e.message || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-black dark:to-slate-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Margin & Charges Calculator
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Calculate margins and charges for your orders before placing them
          </p>
        </div>

        {/* Calculation Type Selector */}
        <div className="mb-6 flex gap-3">
          {['orders', 'basket', 'charges'].map((type) => (
            <button
              key={type}
              onClick={() => setCalculationType(type as any)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                calculationType === type
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
              }`}
            >
              {type === 'orders' && '📊 Order Margins'}
              {type === 'basket' && '🧺 Basket Margins'}
              {type === 'charges' && '💰 Contract Note'}
            </button>
          ))}
        </div>

        {/* Orders Input */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Orders</h2>
            <button
              onClick={addOrder}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              + Add Order
            </button>
          </div>

          <div className="space-y-4">
            {orders.map((order, idx) => (
              <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300">Order #{idx + 1}</h3>
                  {orders.length > 1 && (
                    <button
                      onClick={() => removeOrder(idx)}
                      className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Exchange</label>
                    <select
                      value={order.exchange}
                      onChange={(e) => updateOrder(idx, 'exchange', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white"
                    >
                      <option>NSE</option>
                      <option>BSE</option>
                      <option>NFO</option>
                      <option>MCX</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Symbol</label>
                    <input
                      type="text"
                      value={order.tradingsymbol}
                      onChange={(e) => updateOrder(idx, 'tradingsymbol', e.target.value)}
                      placeholder="e.g. SBIN"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                    <select
                      value={order.transaction_type}
                      onChange={(e) => updateOrder(idx, 'transaction_type', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white"
                    >
                      <option>BUY</option>
                      <option>SELL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product</label>
                    <select
                      value={order.product}
                      onChange={(e) => updateOrder(idx, 'product', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white"
                    >
                      <option>CNC</option>
                      <option>MIS</option>
                      <option>NRML</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Order Type</label>
                    <select
                      value={order.order_type}
                      onChange={(e) => updateOrder(idx, 'order_type', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white"
                    >
                      <option>MARKET</option>
                      <option>LIMIT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={order.quantity}
                      onChange={(e) => updateOrder(idx, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price</label>
                    <input
                      type="number"
                      value={order.price}
                      onChange={(e) => updateOrder(idx, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Trigger Price</label>
                    <input
                      type="number"
                      value={order.trigger_price}
                      onChange={(e) => updateOrder(idx, 'trigger_price', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={calculate}
            disabled={loading || orders.some(o => !o.tradingsymbol)}
            className="mt-6 w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Calculating...' : '🔮 Calculate'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {result && result.data && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">📊 Results</h2>
            
            {calculationType === 'basket' && result.data.final && (
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">Initial Margins</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>SPAN:</span><span className="font-medium">₹{result.data.initial.span?.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Exposure:</span><span className="font-medium">₹{result.data.initial.exposure?.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Premium:</span><span className="font-medium">₹{result.data.initial.option_premium?.toFixed(2)}</span></div>
                    <div className="flex justify-between pt-2 border-t border-blue-300 dark:border-blue-700 font-bold text-base">
                      <span>Total:</span><span className="text-blue-600 dark:text-blue-400">₹{result.data.initial.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">Final Margins (After Spread)</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>SPAN:</span><span className="font-medium">₹{result.data.final.span?.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Exposure:</span><span className="font-medium">₹{result.data.final.exposure?.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Premium:</span><span className="font-medium">₹{result.data.final.option_premium?.toFixed(2)}</span></div>
                    <div className="flex justify-between pt-2 border-t border-green-300 dark:border-green-700 font-bold text-base">
                      <span>Total:</span><span className="text-green-600 dark:text-green-400">₹{result.data.final.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Individual Orders */}
            <div className="space-y-4">
              {(Array.isArray(result.data) ? result.data : result.data.orders || []).map((item: any, idx: number) => (
                <div key={idx} className="p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">{item.tradingsymbol}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{item.exchange} • {item.transaction_type} • {item.product}</p>
                    </div>
                    {item.total !== undefined && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{item.total?.toFixed(2)}</div>
                        <div className="text-xs text-slate-500">Required Margin</div>
                      </div>
                    )}
                  </div>

                  {item.charges && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">STT/CTT</div>
                        <div className="font-medium">₹{item.charges.transaction_tax?.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Exchange Charges</div>
                        <div className="font-medium">₹{item.charges.exchange_turnover_charge?.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">SEBI Charges</div>
                        <div className="font-medium">₹{item.charges.sebi_turnover_charge?.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">GST</div>
                        <div className="font-medium">₹{item.charges.gst?.total?.toFixed(2)}</div>
                      </div>
                      {item.charges.brokerage > 0 && (
                        <div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Brokerage</div>
                          <div className="font-medium">₹{item.charges.brokerage?.toFixed(2)}</div>
                        </div>
                      )}
                      <div className="md:col-span-2">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Total Charges</div>
                        <div className="font-bold text-lg text-red-600 dark:text-red-400">₹{item.charges.total?.toFixed(2)}</div>
                      </div>
                    </div>
                  )}

                  {item.span !== undefined && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">SPAN</div>
                        <div className="font-medium">₹{item.span?.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Exposure</div>
                        <div className="font-medium">₹{item.exposure?.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Premium</div>
                        <div className="font-medium">₹{item.option_premium?.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Leverage</div>
                        <div className="font-medium">{item.leverage}x</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

