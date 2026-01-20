
import React from 'react';
import { Market } from '../types';

interface AssetSelectorProps {
  markets: Market[];
  selected: string;
  onSelect: (symbol: string) => void;
}

export const AssetSelector: React.FC<AssetSelectorProps> = ({ markets, selected, onSelect }) => {
  return (
    <div className="relative group min-w-[240px]">
      <div className="absolute inset-0 bg-foxbit/5 blur-xl group-hover:bg-foxbit/10 transition-all rounded-full"></div>
      <select
        value={selected}
        onChange={(e) => onSelect(e.target.value)}
        className="relative w-full appearance-none bg-[#1a1a1a] border border-white/10 text-white px-10 py-5 pr-14 rounded-full focus:outline-none focus:border-foxbit focus:ring-1 focus:ring-foxbit/30 hover:bg-[#222222] transition-all cursor-pointer font-bold tracking-[0.2em] uppercase text-xl text-center shadow-2xl"
      >
        {markets.map((m) => (
          <option key={m.symbol} value={m.symbol} className="bg-[#1a1a1a] py-4 text-lg">
            {m.base_asset.toUpperCase()}
          </option>
        ))}
      </select>
      <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-hover:text-foxbit transition-colors">
        <i className="fas fa-chevron-down text-sm"></i>
      </div>
    </div>
  );
};
