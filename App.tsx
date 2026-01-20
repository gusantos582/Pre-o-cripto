
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

  const loadData = useCallback(async (initial: boolean = false) => {
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

      setState(prev => {
        const nextMarket = tickerMap[prev.selectedMarket] ? prev.selectedMarket : (tickerMap['btcbrl'] ? 'btcbrl' : tickerList[0]?.market_symbol);
        
        return {
          ...prev,
          markets: marketsList,
          tickers: tickerMap,
          loading: false,
          error: null,
          selectedMarket: nextMarket || 'btcbrl'
        };
      });
      
      setLastUpdate(new Date().toLocaleTimeString('pt-BR'));
    } catch (err) {
      console.error('Erro crítico na atualização de dados:', err);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (isMounted) await loadData(true);
    };
    run();

    const interval = setInterval(() => {
      if (isMounted) loadData();
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [loadData]);

  const selectedTicker = useMemo(() => state.tickers[state.selectedMarket], [state.tickers, state.selectedMarket]);
  const selectedMarketInfo = useMemo(() => state.markets.find(m => m.symbol === state.selectedMarket), [state.markets, state.selectedMarket]);

  const formatLargePrice = (val: string | undefined) => {
    const num = parseFloat(val || '0');
    const decimals = num < 1 ? 6 : (num < 10 ? 4 : 2);
    return new Intl.NumberFormat('pt-BR', { 
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals 
    }).format(isNaN(num) ? 0 : num);
  };

  const formatCurrencyLabel = (val: string | undefined) => {
    const num = parseFloat(val || '0');
    const decimals = num < 1 ? 4 : 2;
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: decimals 
    }).format(isNaN(num) ? 0 : num);
  };

  if (state.loading && state.markets.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0d0d0d]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-[6px] border-[#f26d21] border-t-transparent rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(242,109,33,0.3)]"></div>
          <div className="text-center">
            <h2 className="text-[#f26d21] font-black tracking-[0.4em] text-lg uppercase mb-2">Cripto Price</h2>
            <p className="text-gray-500 font-bold tracking-[0.2em] animate-pulse uppercase text-[10px]">Sincronizando cotações globais...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden text-white bg-[#0d0d0d] font-['Montserrat']">
      <header className="px-10 py-5 flex justify-between items-center border-b border-white/[0.03] bg-black/60 backdrop-blur-2xl z-20">
        <div className="flex items-center space-x-6">
          <div className="bg-gradient-to-br from-[#f26d21] to-[#ff8c42] w-12 h-12 flex items-center justify-center rounded-2xl shadow-[0_10px_25px_rgba(242,109,33,0.4)] transition-all hover:scale-105">
             <i className="fas fa-coins text-black font-black text-2xl"></i>
          </div>
          <div className="border-l border-white/10 pl-6">
            <h1 className="text-2xl font-black tracking-tighter uppercase italic leading-none">
              Cripto <span className="text-[#f26d21] not-italic">Price</span>
            </h1>
            <p className="text-[9px] text-gray-500 font-black tracking-[0.3em] mt-1.5 flex items-center">
               <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>
               MONITORAMENTO EM TEMPO REAL
            </p>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center space-x-12">
            <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-[#f26d21] uppercase tracking-[0.2em] mb-1">Status do Terminal</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                    Sincronizado: {lastUpdate}
                </span>
            </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 relative -mt-6">
        <div className="w-full max-w-6xl flex flex-col items-center z-10">
          
          <div className="mb-14 transform transition-all duration-700 hover:translate-y-[-4px]">
            <AssetSelector 
              markets={state.markets} 
              selected={state.selectedMarket} 
              onSelect={(symbol) => setState(prev => ({ ...prev, selectedMarket: symbol }))} 
            />
          </div>

          <div className="text-center w-full select-none">
            <div className="inline-flex items-center justify-center mb-8 px-8 py-2.5 bg-[#f26d21]/5 border border-[#f26d21]/20 rounded-full backdrop-blur-md">
                <span className="w-2.5 h-2.5 bg-[#f26d21] rounded-full mr-4 shadow-[0_0_10px_#f26d21]"></span>
                <h2 className="text-[#f26d21] text-[12px] font-black tracking-[0.6em] uppercase">
                    MERCADO {selectedMarketInfo?.base_asset || 'ATIVO'} / BRL
                </h2>
            </div>
            
            {selectedTicker ? (
              <div className="relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-r from-[#f26d21]/10 via-transparent to-[#f26d21]/5 blur-[140px] rounded-full pointer-events-none -z-10"></div>
                
                <div className="flex flex-col items-center">
                  <div className="flex items-baseline justify-center mb-6">
                    <span className="text-[#f26d21] text-4xl md:text-6xl font-black mr-8 italic opacity-90 tracking-tighter">R$</span>
                    <h1 className="text-8xl md:text-[13rem] font-black tracking-tighter uppercase leading-none font-mono-trading drop-shadow-[0_25px_70px_rgba(0,0,0,0.9)] transition-all duration-300">
                      {formatLargePrice(selectedTicker.last)}
                    </h1>
                  </div>
                  
                  <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-0 w-full max-w-5xl border-y border-white/[0.04] bg-white/[0.01] backdrop-blur-sm divide-x divide-white/[0.04]">
                    <div className="flex flex-col items-center py-12 px-10 group hover:bg-[#f26d21]/[0.02] transition-colors">
                      <span className="text-[10px] text-gray-500 font-black tracking-[0.4em] uppercase mb-4 group-hover:text-[#f26d21]">Variação (24h)</span>
                      <div className={`flex items-center text-5xl font-black font-mono-trading ${parseFloat(selectedTicker.pct_change) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        <span className="mr-2 text-3xl">{parseFloat(selectedTicker.pct_change) >= 0 ? '▲' : '▼'}</span>
                        {parseFloat(selectedTicker.pct_change) >= 0 ? '+' : ''}{parseFloat(selectedTicker.pct_change).toFixed(2)}%
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center py-12 px-10 group hover:bg-white/[0.02] transition-colors">
                      <span className="text-[10px] text-gray-500 font-black tracking-[0.4em] uppercase mb-4 group-hover:text-white">Máxima Hoje</span>
                      <span className="text-3xl text-gray-100 font-bold font-mono-trading tracking-tighter">
                        {formatCurrencyLabel(selectedTicker.high)}
                      </span>
                    </div>
                    
                    <div className="flex flex-col items-center py-12 px-10 group hover:bg-white/[0.02] transition-colors">
                      <span className="text-[10px] text-gray-500 font-black tracking-[0.4em] uppercase mb-4 group-hover:text-white">Mínima Hoje</span>
                      <span className="text-3xl text-gray-100 font-bold font-mono-trading tracking-tighter">
                        {formatCurrencyLabel(selectedTicker.low)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-24 px-16 border border-white/[0.05] bg-white/[0.02] rounded-[60px] backdrop-blur-3xl shadow-2xl">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-gray-800 border-t-[#f26d21] rounded-full animate-spin mb-8"></div>
                    <p className="text-gray-600 font-black tracking-[0.8em] uppercase text-xs">Capturando dados...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#f26d21]/[0.03] blur-[200px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#f26d21]/[0.02] blur-[180px] rounded-full"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '50px 50px'}}></div>
      </div>

      <TickerMarquee tickers={state.tickers} markets={state.markets} />
    </div>
  );
};

export default App;