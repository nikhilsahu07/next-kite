'use client';

import { useState } from 'react';
import MainLayout from '@/components/MainLayout';

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

// Icons as SVG components
const CalculatorIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const BasketIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

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
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Margin & Charges Calculator
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Calculate margins and charges for your orders before placing them
          </p>
        </div>

        {/* Calculation Type Selector */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setCalculationType('orders')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              calculationType === 'orders'
                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-400'
            }`}
          >
            <CalculatorIcon />
            Order Margins
          </button>
          <button
            onClick={() => setCalculationType('basket')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              calculationType === 'basket'
                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-400'
            }`}
          >
            <BasketIcon />
            Basket Margins
          </button>
          <button
            onClick={() => setCalculationType('charges')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              calculationType === 'charges'
                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-400'
            }`}
          >
            <DocumentIcon />
            Contract Note
          </button>
        </div>

        {/* Orders Input */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Orders</h2>
            <button
              onClick={addOrder}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:opacity-90 transition-all"
            >
              <PlusIcon />
              Add Order
            </button>
          </div>

          <div className="space-y-4">
            {orders.map((order, idx) => (
              <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Order #{idx + 1}</h3>
                  {orders.length > 1 && (
                    <button
                      onClick={() => removeOrder(idx)}
                      className="flex items-center gap-1 px-3 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm transition"
                    >
                      <TrashIcon />
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exchange</label>
                    <select
                      value={order.exchange}
                      onChange={(e) => updateOrder(idx, 'exchange', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
                    >
                      <option>NSE</option>
                      <option>BSE</option>
                      <option>NFO</option>
                      <option>MCX</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Symbol</label>
                    <input
                      type="text"
                      value={order.tradingsymbol}
                      onChange={(e) => updateOrder(idx, 'tradingsymbol', e.target.value)}
                      placeholder="e.g. SBIN"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                    <select
                      value={order.transaction_type}
                      onChange={(e) => updateOrder(idx, 'transaction_type', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
                    >
                      <option>BUY</option>
                      <option>SELL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product</label>
                    <select
                      value={order.product}
                      onChange={(e) => updateOrder(idx, 'product', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
                    >
                      <option>CNC</option>
                      <option>MIS</option>
                      <option>NRML</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order Type</label>
                    <select
                      value={order.order_type}
                      onChange={(e) => updateOrder(idx, 'order_type', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
                    >
                      <option>MARKET</option>
                      <option>LIMIT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={order.quantity}
                      onChange={(e) => updateOrder(idx, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
                    <input
                      type="number"
                      value={order.price}
                      onChange={(e) => updateOrder(idx, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trigger Price</label>
                    <input
                      type="number"
                      value={order.trigger_price}
                      onChange={(e) => updateOrder(idx, 'trigger_price', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={calculate}
            disabled={loading || orders.some(o => !o.tradingsymbol)}
            className="mt-6 w-full py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Calculating...' : 'Calculate Margins'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {result && result.data && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Results</h2>
            
            {calculationType === 'basket' && result.data.final && (
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Initial Margins</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">SPAN:</span><span className="font-medium">₹{result.data.initial.span?.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Exposure:</span><span className="font-medium">₹{result.data.initial.exposure?.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Premium:</span><span className="font-medium">₹{result.data.initial.option_premium?.toFixed(2)}</span></div>
                    <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-700 font-bold text-base">
                      <span>Total:</span><span className="text-gray-900 dark:text-gray-100">₹{result.data.initial.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Final Margins (After Spread)</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">SPAN:</span><span className="font-medium">₹{result.data.final.span?.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Exposure:</span><span className="font-medium">₹{result.data.final.exposure?.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Premium:</span><span className="font-medium">₹{result.data.final.option_premium?.toFixed(2)}</span></div>
                    <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-700 font-bold text-base">
                      <span>Total:</span><span className="text-green-600 dark:text-green-400">₹{result.data.final.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Individual Orders */}
            <div className="space-y-4">
              {(Array.isArray(result.data) ? result.data : result.data.orders || []).map((item: any, idx: number) => (
                <div key={idx} className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{item.tradingsymbol}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.exchange} • {item.transaction_type} • {item.product}</p>
                    </div>
                    {item.total !== undefined && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{item.total?.toFixed(2)}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Required Margin</div>
                      </div>
                    )}
                  </div>

                  {item.charges && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">STT/CTT</div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">₹{item.charges.transaction_tax?.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Exchange Charges</div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">₹{item.charges.exchange_turnover_charge?.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">SEBI Charges</div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">₹{item.charges.sebi_turnover_charge?.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">GST</div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">₹{item.charges.gst?.total?.toFixed(2)}</div>
                      </div>
                      {item.charges.brokerage > 0 && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Brokerage</div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">₹{item.charges.brokerage?.toFixed(2)}</div>
                        </div>
                      )}
                      <div className="md:col-span-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Total Charges</div>
                        <div className="font-bold text-lg text-red-600 dark:text-red-400">₹{item.charges.total?.toFixed(2)}</div>
                      </div>
                    </div>
                  )}

                  {item.span !== undefined && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">SPAN</div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">₹{item.span?.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Exposure</div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">₹{item.exposure?.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Premium</div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">₹{item.option_premium?.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Leverage</div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{item.leverage}x</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

