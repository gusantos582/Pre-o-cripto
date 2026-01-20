import React from 'react';
import { Market } from '../types';

interface AssetSelectorProps {
  markets: Market[];
  selected: string;
  onSelect: (symbol: string) => void;
}

export const AssetSelector: React.FC<AssetSelectorProps> = ({ markets, selected, onSelect }) => {
  return (
    <div className="relative w-full max-w-[320px] px-2">
      <div className="absolute inset-0 bg-[#f26d21]/10 blur-xl rounded-full"></div>
      <select
        value={selected}
        onChange={(e) => onSelect(e.target.value)}
        className="relative w-full appearance-none bg-[#111] border border-white/10 text-white px-6 py-4 rounded-xl focus:outline-none focus:border-[#f26d21] hover:bg-[#181818] transition-all cursor-pointer font-bold tracking-widest uppercase text-center text-sm md:text-base shadow-xl"
      >
        {markets.map((m) => (
          <option key={m.symbol} value={m.symbol}>
            {m.base_asset} / BRL
          </option>
        ))}
      </select>
      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#f26d21]">
        <i className="fas fa-chevron-down text-xs"></i>
      </div>
    </div>
  );
};