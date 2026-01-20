import React from 'react';
import { Ticker, Market } from '../types';

interface TickerMarqueeProps {
  tickers: Record<string, Ticker>;
  markets: Market[];
}

const TickerItem: React.FC<{ ticker: Ticker; market?: Market }> = ({ ticker, market }) => {
  const lastPrice = parseFloat(ticker.last || '0');
  const pctChange = parseFloat(ticker.pct_change || '0');
  const isPositive = pctChange >= 0;
  const base = market ? market.base_asset : ticker.market_symbol.replace('brl', '').toUpperCase();

  return (
    <div className="flex items-center space-x-4 px-6 md:px-10 border-r border-white/5 h-10 md:h-12">
      <span className="font-black text-gray-500 text-[10px] md:text-xs tracking-widest uppercase whitespace-nowrap">{base}</span>
      <span className="font-mono-trading text-xs md:text-sm font-bold whitespace-nowrap">
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lastPrice)}
      </span>
      <span className={`text-[10px] md:text-xs font-black ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? '▲' : '▼'} {Math.abs(pctChange).toFixed(2)}%
      </span>
    </div>
  );
};

export const TickerMarquee: React.FC<TickerMarqueeProps> = ({ tickers, markets }) => {
  const tickerList = Object.values(tickers);
  if (tickerList.length === 0) return null;

  const displayList = [...tickerList, ...tickerList, ...tickerList, ...tickerList];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-black border-t border-white/5 z-50 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap flex items-center">
        {displayList.map((ticker, idx) => (
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