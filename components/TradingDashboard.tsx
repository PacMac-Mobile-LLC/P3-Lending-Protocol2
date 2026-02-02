
import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { UserProfile, Asset } from '../types';
import { Button } from './Button';
import { MarketDataService, ASSET_IDS } from '../services/marketDataService';

// Base assets structure (will be hydrated with real data)
const INITIAL_ASSETS: Asset[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', currentPrice: 0, priceChange24h: 0, color: '#f7931a', marketCap: '-', description: 'Bitcoin is the first decentralized digital currency.' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', currentPrice: 0, priceChange24h: 0, color: '#627eea', marketCap: '-', description: 'Ethereum is a decentralized platform that enables smart contracts.' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', currentPrice: 0, priceChange24h: 0, color: '#00e599', marketCap: '-', description: 'Solana is a high-performance blockchain supporting builders around the world.' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', currentPrice: 0, priceChange24h: 0, color: '#fbbf24', marketCap: '-', description: 'Dogecoin is an open source peer-to-peer digital currency.' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', currentPrice: 0, priceChange24h: 0, color: '#2a5ada', marketCap: '-', description: 'Chainlink is a decentralized oracle network.' },
];

const TIME_RANGES = ['1D', '1W', '1M', '1Y', 'ALL'];

interface Props {
  user: UserProfile;
  onTrade: (asset: Asset, amount: number, isBuy: boolean) => void;
}

export const TradingDashboard: React.FC<Props> = ({ user, onTrade }) => {
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<Asset>(INITIAL_ASSETS[0]);
  const [timeRange, setTimeRange] = useState('1D');
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Trade Form State
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Fetch Real Prices on Mount & Interval
  useEffect(() => {
    const fetchPrices = async () => {
      const ids = assets.map(a => a.id);
      const data = await MarketDataService.getPrices(ids);
      
      if (data) {
        setAssets(prev => prev.map(asset => {
          const coinData = data[asset.id];
          if (!coinData) return asset;
          return {
            ...asset,
            currentPrice: coinData.usd,
            priceChange24h: coinData.usd_24h_change,
            marketCap: MarketDataService.formatMarketCap(coinData.usd_market_cap)
          };
        }));
        setLastUpdated(new Date());
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Update every 30s to respect free API limits
    return () => clearInterval(interval);
  }, []); // Run once on mount, then interval

  // 2. Sync Selected Asset when Assets Update
  useEffect(() => {
    const updated = assets.find(a => a.id === selectedAsset.id);
    if (updated) setSelectedAsset(updated);
  }, [assets]);

  // 3. Fetch Historical Chart Data
  useEffect(() => {
    const fetchChart = async () => {
      setIsLoadingChart(true);
      const history = await MarketDataService.getChartHistory(selectedAsset.id, timeRange);
      
      if (history.length > 0) {
        setChartData(history);
      } else {
        // Fallback flat line if API error
        setChartData([{time: Date.now(), price: selectedAsset.currentPrice}]);
      }
      setIsLoadingChart(false);
    };

    fetchChart();
  }, [selectedAsset.id, timeRange]);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate tx time
    
    const numAmount = parseFloat(amount);
    onTrade(selectedAsset, numAmount, orderType === 'BUY');
    
    setIsProcessing(false);
    setAmount('');
    alert(`Order Executed: ${orderType} $${amount} of ${selectedAsset.symbol}`);
  };

  const getHoldings = (symbol: string) => {
    const item = user.portfolio?.find(p => p.symbol === symbol);
    return item ? item.amount : 0;
  };

  const isPositive = selectedAsset.priceChange24h >= 0;
  const chartColor = isPositive ? '#00e599' : '#ef4444';

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
      
      {/* LEFT: Main Chart Area */}
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar border-r border-zinc-900 bg-[#050505]">
        <div className="p-8 pb-0">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                {selectedAsset.name}
                <span className="text-sm bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">{selectedAsset.symbol}</span>
              </h1>
              <div className="flex items-baseline gap-4 mt-1">
                <span className={`text-4xl font-bold font-mono tracking-tight ${isPositive ? 'text-[#00e599]' : 'text-red-500'} transition-colors duration-500`}>
                  ${selectedAsset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`text-sm font-medium flex items-center ${isPositive ? 'text-[#00e599]' : 'text-red-500'}`}>
                  {isPositive ? '▲' : '▼'} {Math.abs(selectedAsset.priceChange24h).toFixed(2)}% (24h)
                </span>
              </div>
            </div>
            
            <div className="hidden md:block text-right">
              <span className="text-xs text-zinc-500 font-mono block">MARKET CAP</span>
              <div className="text-white font-bold">{selectedAsset.marketCap}</div>
              <span className="text-[9px] text-zinc-600 mt-1">Updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>

          {/* CHART */}
          <div className="h-[400px] w-full relative group cursor-crosshair bg-[#050505]">
            {isLoadingChart && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20 backdrop-blur-sm">
                <div className="w-8 h-8 border-2 border-[#00e599] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis 
                  domain={['auto', 'auto']} 
                  hide 
                  width={0}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontFamily: 'monospace' }}
                  labelStyle={{ display: 'none' }}
                  formatter={(value: number) => [`$${value.toLocaleString(undefined, {minimumFractionDigits: 2})}`, 'Price']}
                  labelFormatter={(label) => new Date(label).toLocaleString()}
                  cursor={{ stroke: '#52525b', strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke={chartColor} 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                  animationDuration={1000}
                  isAnimationActive={false} // Disable animation for smoother interactions with large datasets
                />
              </AreaChart>
            </ResponsiveContainer>
            
            {/* Live Indicator Line */}
            <div className="absolute right-0 top-0 bottom-0 w-px bg-zinc-800 pointer-events-none border-r border-dashed border-zinc-700"></div>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-1 border-b border-zinc-900 pb-4 mt-4">
            {TIME_RANGES.map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${timeRange === range ? 'text-white bg-zinc-800' : 'text-zinc-500 hover:text-white'}`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Buying Power & About */}
        <div className="p-8 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
               <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Your Position</h3>
               <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-4">
                 <span className="text-white font-bold">{selectedAsset.symbol} Held</span>
                 <span className="font-mono text-white">{getHoldings(selectedAsset.symbol).toFixed(4)}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-white font-bold">Equity Value</span>
                 <span className="font-mono text-white">${(getHoldings(selectedAsset.symbol) * selectedAsset.currentPrice).toFixed(2)}</span>
               </div>
             </div>

             <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
               <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">About {selectedAsset.name}</h3>
               <p className="text-sm text-zinc-400 leading-relaxed">
                 {selectedAsset.description}
               </p>
             </div>
           </div>
        </div>
      </div>

      {/* RIGHT: Order Form & Watchlist */}
      <div className="w-full md:w-80 bg-[#0a0a0a] flex flex-col border-l border-zinc-900 h-full">
        
        {/* Order Form */}
        <div className="p-6 border-b border-zinc-900">
          <div className="bg-zinc-900 rounded-xl p-1 flex mb-6">
            <button 
              onClick={() => setOrderType('BUY')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${orderType === 'BUY' ? 'bg-[#00e599] text-black shadow-lg' : 'text-zinc-400 hover:text-white'}`}
            >
              Buy
            </button>
            <button 
               onClick={() => setOrderType('SELL')}
               className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${orderType === 'SELL' ? 'bg-red-500 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
            >
              Sell
            </button>
          </div>

          <form onSubmit={handleOrderSubmit} className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                 <label className="text-xs font-bold text-white">Amount (USD)</label>
                 <span className="text-xs text-[#00e599]">Buying Power: ${user.balance.toFixed(2)}</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-3 text-white font-mono">$</span>
                <input 
                  type="number" 
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-8 pr-4 text-white font-mono text-lg focus:border-[#00e599] outline-none transition-all"
                />
              </div>
            </div>
            
            {amount && (
               <div className="flex justify-between text-xs text-zinc-500 font-mono px-1">
                 <span>Est. Qty</span>
                 <span>{(parseFloat(amount) / selectedAsset.currentPrice).toFixed(6)} {selectedAsset.symbol}</span>
               </div>
            )}

            <Button 
               type="submit" 
               className={`w-full py-4 text-lg ${orderType === 'BUY' ? 'bg-[#00e599] text-black' : 'bg-red-500 text-white border-red-600 hover:bg-red-600'}`}
               isLoading={isProcessing}
            >
              {orderType === 'BUY' ? 'Review Order' : 'Review Sale'}
            </Button>
          </form>
        </div>

        {/* Watchlist */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0a0a0a]">
           <div className="p-4 border-b border-zinc-900 sticky top-0 bg-[#0a0a0a] z-10 flex justify-between items-center">
             <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Watchlist</h3>
             {assets[0].currentPrice === 0 && <span className="text-[9px] text-[#00e599] animate-pulse">Connecting...</span>}
           </div>
           
           {assets.map(asset => (
             <div 
               key={asset.id} 
               onClick={() => setSelectedAsset(asset)}
               className={`p-4 border-b border-zinc-900 cursor-pointer hover:bg-zinc-900/50 transition-colors flex justify-between items-center ${selectedAsset.id === asset.id ? 'bg-zinc-900 border-l-2 border-l-[#00e599]' : 'border-l-2 border-l-transparent'}`}
             >
               <div>
                 <div className="font-bold text-white text-sm">{asset.symbol}</div>
                 <div className="text-xs text-zinc-500">
                   {getHoldings(asset.symbol) > 0 ? `${getHoldings(asset.symbol).toFixed(4)} held` : asset.name}
                 </div>
               </div>
               <div className="text-right">
                  <div className="text-white font-mono text-sm">${asset.currentPrice.toLocaleString()}</div>
                  <div className={`text-xs font-mono ${asset.priceChange24h >= 0 ? 'text-[#00e599]' : 'text-red-500'}`}>
                    {asset.priceChange24h >= 0 ? '+' : ''}{asset.priceChange24h.toFixed(2)}%
                  </div>
               </div>
             </div>
           ))}
        </div>

      </div>
    </div>
  );
};
