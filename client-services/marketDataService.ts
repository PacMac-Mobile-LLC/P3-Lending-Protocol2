
// CoinGecko Public API
const API_BASE = 'https://api.coingecko.com/api/v3';

// Reversible obfuscation helper
const reverseString = (str: string) => str.split('').reverse().join('');

declare const __P3_COINGECKO_KEY__: string;

// Safely retrieve API Key
let API_KEY = '';
try {
  const rawKey = typeof __P3_COINGECKO_KEY__ !== 'undefined' ? __P3_COINGECKO_KEY__ : '';
  API_KEY = reverseString(rawKey);
} catch (e) {
  console.warn("Using public CoinGecko endpoints (No API Key detected)");
}

export const ASSET_IDS = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'DOGE': 'dogecoin',
  'LINK': 'chainlink',
  'AAVE': 'aave',
  'UNI': 'uniswap'
};

export interface MarketData {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
    usd_market_cap: number;
  }
}

export const MarketDataService = {
  // Fetch current price, 24h change, and market cap
  getPrices: async (ids: string[]): Promise<MarketData | null> => {
    try {
      const apiKeyParam = API_KEY ? `&x_cg_demo_api_key=${API_KEY}` : '';
      const response = await fetch(
        `${API_BASE}/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true${apiKeyParam}`,
        { method: 'GET', headers: { 'Accept': 'application/json' } }
      );

      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn("Market Data Fetch Error:", error);
      return null;
    }
  },

  // Fetch historical chart data
  getChartHistory: async (coinId: string, days: string): Promise<any[]> => {
    try {
      // Map UI ranges to API params
      // CoinGecko 'days': 1 = 24h, 7 = 7d, etc.
      let apiDays = '1';
      if (days === '1W') apiDays = '7';
      if (days === '1M') apiDays = '30';
      if (days === '1Y') apiDays = '365';
      if (days === 'ALL') apiDays = 'max';

      const apiKeyParam = API_KEY ? `&x_cg_demo_api_key=${API_KEY}` : '';
      const response = await fetch(
        `${API_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${apiDays}${apiKeyParam}`,
        { method: 'GET', headers: { 'Accept': 'application/json' } }
      );

      if (!response.ok) throw new Error(`Chart API Error: ${response.status}`);

      const data = await response.json();
      // CoinGecko returns [timestamp, price] arrays
      return data.prices.map((p: [number, number]) => ({
        time: p[0],
        price: p[1]
      }));
    } catch (error) {
      console.error("Chart fetch failed", error);
      return [];
    }
  },

  formatMarketCap: (num: number): string => {
    if (!num) return '-';
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    return num.toLocaleString();
  }
};
