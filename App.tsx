import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchMarkets, fetchTickers } from './services/foxbitService';
import { AppState, Ticker, Market } from './types';
import { TickerMarquee } from './components/TickerMarquee';
import { AssetSelector } from './components/AssetSelector';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    markets: [],
    tickers: {},
    selectedMarket: 'btcbrl',
    loading: true,
    error: null,
  });

  const [lastUpdate, setLastUpdate] = useState<string>('');

  const loadData = useCallback(async () => {
    try {
      const tickerList = await fetchTickers();
      const tickerMap: Record<string, Ticker> = {};
      
      tickerList.forEach(t => {
        tickerMap[t.market_symbol] = t;
      });

      const marketsList: Market[] = tickerList.map(t => {
        const base = t.market_symbol.replace('brl', '').toUpperCase();
        return {
          symbol: t.market_symbol,
          base_asset: base,
          quote_asset: 'BRL',
          quantity_precision: 8,
          price_precision: 2
        };
      });

      setState(prev => ({
        ...prev,
        markets: marketsList,
        tickers: tickerMap,
        loading: false,
        selectedMarket: tickerMap[prev.selectedMarket] ? prev.selectedMarket : (tickerMap['btcbrl'] ? 'btcbrl' : tickerList[0]?.market_symbol || 'btcbrl')
      }));
      
      setLastUpdate(new Date().toLocaleTimeString('pt-BR'));
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  const selectedTicker = useMemo(() => state.tickers[state.selectedMarket], [state.tickers, state.selectedMarket]);
  const selectedMarketInfo = useMemo(() => state.markets.find(m => m.symbol === state.selectedMarket), [state.markets, state.selectedMarket]);

  const formatLargePrice = (val: string | undefined) => {
    const num = parseFloat(val || '0');
    const decimals = num < 1 ? 6 : (num < 10 ? 4 : 2);
    return new Intl.NumberFormat('pt-BR', { 
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals 
    }).format(num);
  };

  const formatCurrencyLabel = (val: string | undefined) => {
    const num = parseFloat(val || '0');
    const decimals = num < 1 ? 4 : 2;
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: decimals 
    }).format(num);
  };

  if (state.loading && state.markets.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0d0d0d]">
        <div className="w-12 h-12 border-4 border-[#f26d21] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen text-white bg-[#0d0d0d] font-['Montserrat'] overflow-x-hidden">
      {/* Header Responsivo */}
      <header className="px-4 md:px-10 py-4 flex justify-between items-center border-b border-white/5 bg-black/50 backdrop-blur-xl z-20 sticky top-0">
        <div className="flex items-center space-x-3">
          <div className="bg-[#f26d21] p-2 rounded-lg shadow-[0_0_15px_rgba(242,109,33,0.4)]">
             <i className="fas fa-chart-line text-black text-lg"></i>
          </div>
          <h1 className="text-lg md:text-xl font-black uppercase tracking-tighter">
            CRIPTO <span className="text-[#f26d21]">LIVE</span>
          </h1>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Última Atualização</p>
          <p className="text-xs font-mono-trading text-gray-300 bg-white/5 px-2 py-1 rounded-md">{lastUpdate}</p>
        </div>
      </header>

      {/* Main Content que se ajusta ao tamanho da aba */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative">
        <div className="w-full max-w-5xl flex flex-col items-center space-y-8 md:space-y-12 mb-20">
          
          <AssetSelector 
            markets={state.markets} 
            selected={state.selectedMarket} 
            onSelect={(symbol) => setState(prev => ({ ...prev, selectedMarket: symbol }))} 
          />

          <div className="text-center w-full">
            <h2 className="text-[#f26d21] text-[10px] md:text-xs font-black tracking-[0.4em] uppercase mb-4 opacity-70">
              COTANDO AGORA: {selectedMarketInfo?.base_asset || '---'}
            </h2>
            
            {selectedTicker ? (
              <div className="flex flex-col items-center">
                {/* Preço Gigante que escala com o viewport (vw) */}
                <div className="flex items-baseline justify-center flex-wrap">
                  <span className="text-xl md:text-4xl font-black text-[#f26d21] mr-2 md:mr-4 opacity-80">R$</span>
                  <h1 className="text-[12vw] sm:text-[10vw] md:text-[8vw] lg:text-[7rem] font-black tracking-tighter uppercase leading-none font-mono-trading drop-shadow-2xl">
                    {formatLargePrice(selectedTicker.last)}
                  </h1>
                </div>
                
                {/* Stats Grid - Muda de 1 para 3 colunas */}
                <div className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-0 w-full bg-white/[0.02] border border-white/5 rounded-2xl md:divide-x divide-white/5 overflow-hidden">
                  <div className="p-6 md:p-8 flex flex-col items-center">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Variação 24h</span>
                    <span className={`text-2xl md:text-4xl font-black font-mono-trading ${parseFloat(selectedTicker.pct_change) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {parseFloat(selectedTicker.pct_change) >= 0 ? '+' : ''}{parseFloat(selectedTicker.pct_change).toFixed(2)}%
                    </span>
                  </div>
                  
                  <div className="p-6 md:p-8 flex flex-col items-center border-t border-white/5 sm:border-t-0">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Máxima</span>
                    <span className="text-xl md:text-2xl font-bold font-mono-trading">
                      {formatCurrencyLabel(selectedTicker.high)}
                    </span>
                  </div>
                  
                  <div className="p-6 md:p-8 flex flex-col items-center border-t border-white/5 sm:border-t-0">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Mínima</span>
                    <span className="text-xl md:text-2xl font-bold font-mono-trading">
                      {formatCurrencyLabel(selectedTicker.low)}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      {/* Marquee fixo no rodapé */}
      <TickerMarquee tickers={state.tickers} markets={state.markets} />

      {/* Efeitos de fundo responsivos */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#f26d21]/5 blur-[120px] rounded-full"></div>
      </div>
    </div>
  );
};

export default App;