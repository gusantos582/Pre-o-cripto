
import React from 'react';
import { Ticker, Market } from '../types';

interface TickerMarqueeProps {
  tickers: Record<string, Ticker>;
  markets: Market[];
}

const formatValue = (val: string | undefined): number => {
  const parsed = parseFloat(val || '0');
  return isNaN(parsed) ? 0 : parsed;
};

const TickerItem: React.FC<{ ticker: Ticker; market?: Market }> = ({ ticker, market }) => {
  const lastPrice = formatValue(ticker.last);
  const pctChange = formatValue(ticker.pct_change);
  const isPositive = pctChange >= 0;
  
  const base = market ? market.base_asset : ticker.market_symbol.replace('brl', '').toUpperCase();
  const label = `${base}/BRL`.toUpperCase();

  return (
    <div className="flex items-center space-x-6 px-10 border-r border-white/5 h-14 hover:bg-white/[0.02] transition-colors cursor-default">
      <span className="font-extrabold text-[#777] text-xs tracking-widest">{label}</span>
      <span className="font-mono-trading text-sm font-bold tracking-tighter">
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lastPrice)}
      </span>
      <span className={`text-xs font-black px-2 py-1 rounded ${isPositive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
        {isPositive ? '+' : ''}{pctChange.toFixed(2)}%
      </span>
    </div>
  );
};

export const TickerMarquee: React.FC<TickerMarqueeProps> = ({ tickers, markets }) => {
  const tickerList: Ticker[] = Object.values(tickers);

  if (tickerList.length === 0) return null;

  // Quadruple the list for extra smooth looping
  const duplicatedList: Ticker[] = [...tickerList, ...tickerList, ...tickerList, ...tickerList];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#0a0a0a] border-t border-white/5 py-0 z-50 overflow-hidden shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="animate-marquee whitespace-nowrap py-1">
        {duplicatedList.map((ticker: Ticker, idx: number) => (
          <TickerItem 
            key={`${ticker.market_symbol}-${idx}`} 
            ticker={ticker} 
            market={markets.find(m => m.symbol === ticker.market_symbol)} 
          />
        ))}
      </div>
    </div>
  );
};
