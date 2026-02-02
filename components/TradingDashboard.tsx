
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { UserProfile, Asset, PortfolioItem } from '../types';
import { Button } from './Button';

// --- MOCK DATA ---
const MOCK_ASSETS: Asset[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', currentPrice: 64230.50, priceChange24h: 2.4, color: '#f7931a', marketCap: '1.2T', description: 'Bitcoin is a decentralized digital currency, without a central bank or single administrator.' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', currentPrice: 3450.20, priceChange24h: -1.2, color: '#627eea', marketCap: '400B', description: 'Ethereum is a decentralized, open-source blockchain with smart contract functionality.' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', currentPrice: 145.80, priceChange24h: 5.6, color: '#00e599', marketCap: '65B', description: 'Solana is a public blockchain platform. It achieves consensus using proof of stake and proof of history.' },
  { id: 'doge', symbol: 'DOGE', name: 'Dogecoin', currentPrice: 0.16, priceChange24h: 12.0, color: '#fbbf24', marketCap: '22B', description: 'Dogecoin is a cryptocurrency created by software engineers Billy Markus and Jackson Palmer, who decided to create a payment system as a "joke".' },
];

const TIME_RANGES = ['1H', '1D', '1W', '1M', '1Y', 'ALL'];

interface Props {
  user: UserProfile;
  onTrade: (asset: Asset, amount: number, isBuy: boolean) => void;
}

export const TradingDashboard: React.FC<Props> = ({ user, onTrade }) => {
  const [selectedAsset, setSelectedAsset] = useState<Asset>(MOCK_ASSETS[0]);
  const [timeRange, setTimeRange] = useState('1D');
  const [chartData, setChartData] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState(selectedAsset.currentPrice);
  
  // Trade Form State
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate Chart Data
  useEffect(() => {
    // Generate simulated chart data based on selected asset and time range
    const data = [];
    let price = selectedAsset.currentPrice * (1 - (selectedAsset.priceChange24h / 100)); // Start from yesterday
    const points = 50;
    
    for (let i = 0; i < points; i++) {
      const volatility = selectedAsset.symbol === 'DOGE' ? 0.02 : 0.005;
      const change = 1 + (Math.random() * volatility - (volatility/2));
      price = price * change;
      data.push({
        time: i,
        price: price
      });
    }
    // Ensure the last point connects to current price
    data.push({ time: points, price: selectedAsset.currentPrice });
    setChartData(data);
    setCurrentPrice(selectedAsset.currentPrice);
  }, [selectedAsset, timeRange]);

  // Live Price Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice(prev => {
        const movement = Math.random() > 0.5 ? 1.0005 : 0.9995;
        return prev * movement;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate tx
    
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
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      
      {/* LEFT: Main Chart Area */}
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar border-r border-zinc-900">
        <div className="p-8 pb-0">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">{selectedAsset.name}</h1>
              <div className="flex items-baseline gap-4 mt-1">
                <span className={`text-4xl font-bold font-mono tracking-tight ${isPositive ? 'text-[#00e599]' : 'text-red-500'} transition-colors duration-500`}>
                  ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`text-sm font-medium flex items-center ${isPositive ? 'text-[#00e599]' : 'text-red-500'}`}>
                  {isPositive ? '▲' : '▼'} {Math.abs(selectedAsset.priceChange24h)}% (24h)
                </span>
              </div>
            </div>
            
            <div className="hidden md:block">
              <span className="text-xs text-zinc-500 font-mono">MARKET CAP</span>
              <div className="text-white font-bold">{selectedAsset.marketCap}</div>
            </div>
          </div>

          {/* CHART */}
          <div className="h-[400px] w-full relative group cursor-crosshair">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontFamily: 'monospace' }}
                  labelStyle={{ display: 'none' }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
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
                 <span className="font-mono text-white">{getHoldings(selectedAsset.symbol)}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-white font-bold">Equity Value</span>
                 <span className="font-mono text-white">${(getHoldings(selectedAsset.symbol) * currentPrice).toFixed(2)}</span>
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
      <div className="w-80 bg-[#0a0a0a] flex flex-col border-l border-zinc-900">
        
        {/* Order Form */}
        <div className="p-6 border-b border-zinc-900">
          <div className="bg-zinc-900 rounded-xl p-1 flex mb-6">
            <button 
              onClick={() => setOrderType('BUY')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${orderType === 'BUY' ? 'bg-[#00e599] text-black shadow-lg' : 'text-zinc-400 hover:text-white'}`}
            >
              Buy {selectedAsset.symbol}
            </button>
            <button 
               onClick={() => setOrderType('SELL')}
               className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${orderType === 'SELL' ? 'bg-red-500 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
            >
              Sell {selectedAsset.symbol}
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
                 <span>{(parseFloat(amount) / currentPrice).toFixed(6)} {selectedAsset.symbol}</span>
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
        <div className="flex-1 overflow-y-auto custom-scrollbar">
           <div className="p-4 border-b border-zinc-900 sticky top-0 bg-[#0a0a0a] z-10">
             <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Watchlist</h3>
           </div>
           
           {MOCK_ASSETS.map(asset => (
             <div 
               key={asset.id} 
               onClick={() => setSelectedAsset(asset)}
               className={`p-4 border-b border-zinc-900 cursor-pointer hover:bg-zinc-900/50 transition-colors flex justify-between items-center ${selectedAsset.id === asset.id ? 'bg-zinc-900 border-l-2 border-l-[#00e599]' : 'border-l-2 border-l-transparent'}`}
             >
               <div>
                 <div className="font-bold text-white text-sm">{asset.symbol}</div>
                 <div className="text-xs text-zinc-500">{getHoldings(asset.symbol) > 0 ? `${getHoldings(asset.symbol)} shares` : asset.name}</div>
               </div>
               <div className="text-right">
                  <div className="text-white font-mono text-sm">${asset.currentPrice.toLocaleString()}</div>
                  <div className={`text-xs font-mono ${asset.priceChange24h >= 0 ? 'text-[#00e599]' : 'text-red-500'}`}>
                    {asset.priceChange24h >= 0 ? '+' : ''}{asset.priceChange24h}%
                  </div>
               </div>
             </div>
           ))}
        </div>

      </div>
    </div>
  );
};
