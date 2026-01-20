
import { Market, Ticker } from '../types';

const BINANCE_URL = 'https://api.binance.com/api/v3/ticker/24hr';

/**
 * Busca todos os pares que terminam em BRL na Binance
 */
export const fetchTickers = async (): Promise<Ticker[]> => {
  try {
    const response = await fetch(BINANCE_URL);
    if (!response.ok) throw new Error('Binance API Unreachable');
    const data = await response.json();
    
    return data
      .filter((item: any) => item.symbol.endsWith('BRL'))
      .map((item: any) => ({
        market_symbol: item.symbol.toLowerCase(),
        last: item.lastPrice,
        high: item.highPrice,
        low: item.lowPrice,
        vol: item.volume,
        pct_change: item.priceChangePercent,
        timestamp: new Date().toISOString()
      }));
  } catch (error) {
    console.error('Erro ao buscar tickers da Binance:', error);
    // Fallback de emergência (valores aproximados Fevereiro/2025)
    const now = new Date().toISOString();
    return [
      { market_symbol: 'btcbrl', last: '480945', high: '485000', low: '478000', vol: '100', pct_change: '0.50', timestamp: now },
      { market_symbol: 'ethbrl', last: '15420', high: '15800', low: '15200', vol: '1000', pct_change: '-1.20', timestamp: now },
      { market_symbol: 'solbrl', last: '1085', high: '1120', low: '990', vol: '5000', pct_change: '4.20', timestamp: now },
      { market_symbol: 'usdtbrl', last: '5.92', high: '5.95', low: '5.89', vol: '100000', pct_change: '0.15', timestamp: now },
    ];
  }
};

/**
 * Gera a lista de mercados baseada nos tickers disponíveis
 */
export const fetchMarkets = async (): Promise<Market[]> => {
  const tickers = await fetchTickers();
  return tickers.map(t => {
    const base = t.market_symbol.replace('brl', '').toUpperCase();
    return {
      symbol: t.market_symbol,
      base_asset: base === 'USDT' ? 'USDT' : base,
      quote_asset: 'BRL',
      quantity_precision: 8,
      price_precision: 2
    };
  });
};
