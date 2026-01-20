
export interface Market {
  symbol: string;
  quantity_precision: number;
  price_precision: number;
  base_asset: string;
  quote_asset: string;
}

export interface Ticker {
  market_symbol: string;
  last: string;
  high: string;
  low: string;
  vol: string;
  pct_change: string;
  timestamp: string;
}

export interface AppState {
  markets: Market[];
  tickers: Record<string, Ticker>;
  selectedMarket: string;
  loading: boolean;
  error: string | null;
}
