// Kite Connect Types
export interface KiteProfile {
  user_id: string;
  user_name: string;
  user_shortname: string;
  email: string;
  user_type: string;
  broker: string;
  exchanges: string[];
  products: string[];
  order_types: string[];
  avatar_url: string | null;
}

export interface Position {
  tradingsymbol: string;
  exchange: string;
  instrument_token: number;
  product: string;
  quantity: number;
  overnight_quantity: number;
  multiplier: number;
  average_price: number;
  close_price: number;
  last_price: number;
  value: number;
  pnl: number;
  m2m: number;
  unrealised: number;
  realised: number;
  buy_quantity: number;
  buy_price: number;
  buy_value: number;
  buy_m2m: number;
  sell_quantity: number;
  sell_price: number;
  sell_value: number;
  sell_m2m: number;
  day_buy_quantity: number;
  day_buy_price: number;
  day_buy_value: number;
  day_sell_quantity: number;
  day_sell_price: number;
  day_sell_value: number;
}

export interface Holding {
  tradingsymbol: string;
  exchange: string;
  instrument_token: number;
  isin: string;
  product: string;
  price: number;
  quantity: number;
  t1_quantity: number;
  realised_quantity: number;
  authorised_quantity: number;
  authorised_date: string;
  opening_quantity: number;
  collateral_quantity: number;
  collateral_type: string;
  discrepancy: boolean;
  average_price: number;
  last_price: number;
  close_price: number;
  pnl: number;
  day_change: number;
  day_change_percentage: number;
}

export interface Order {
  order_id: string;
  parent_order_id: string | null;
  exchange_order_id: string | null;
  placed_by: string;
  variety: string;
  status: string;
  tradingsymbol: string;
  exchange: string;
  instrument_token: number;
  transaction_type: string;
  order_type: string;
  product: string;
  validity: string;
  price: number;
  quantity: number;
  trigger_price: number;
  average_price: number;
  pending_quantity: number;
  filled_quantity: number;
  disclosed_quantity: number;
  market_protection: number;
  order_timestamp: string;
  exchange_timestamp: string | null;
  status_message: string | null;
  tag: string | null;
}

export interface Quote {
  instrument_token: number;
  timestamp: string;
  last_price: number;
  last_quantity: number;
  last_trade_time: string;
  average_price: number;
  volume: number;
  buy_quantity: number;
  sell_quantity: number;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  ohlc: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
  depth: {
    buy: Array<{ quantity: number; price: number; orders: number }>;
    sell: Array<{ quantity: number; price: number; orders: number }>;
  };
}

export interface TickData {
  mode: 'ltp' | 'quote' | 'full';
  instrument_token: number;
  last_price: number;
  last_traded_quantity?: number;
  average_traded_price?: number;
  volume_traded?: number;
  total_buy_quantity?: number;
  total_sell_quantity?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  change?: number;
  last_trade_time?: Date;
  oi?: number;
  oi_day_high?: number;
  oi_day_low?: number;
  depth?: {
    buy: Array<{ quantity: number; price: number; orders: number }>;
    sell: Array<{ quantity: number; price: number; orders: number }>;
  };
}

export interface Margins {
  equity?: {
    enabled: boolean;
    net: number;
    available: {
      adhoc_margin: number;
      cash: number;
      opening_balance: number;
      live_balance: number;
      collateral: number;
      intraday_payin: number;
    };
    utilised: {
      debits: number;
      exposure: number;
      m2m_realised: number;
      m2m_unrealised: number;
      option_premium: number;
      payout: number;
      span: number;
      holding_sales: number;
      turnover: number;
      liquid_collateral: number;
      stock_collateral: number;
    };
  };
  commodity?: {
    enabled: boolean;
    net: number;
    available: {
      adhoc_margin: number;
      cash: number;
      opening_balance: number;
      live_balance: number;
      collateral: number;
      intraday_payin: number;
    };
    utilised: {
      debits: number;
      exposure: number;
      m2m_realised: number;
      m2m_unrealised: number;
      option_premium: number;
      payout: number;
      span: number;
      holding_sales: number;
      turnover: number;
      liquid_collateral: number;
      stock_collateral: number;
    };
  };
}

