
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Fallback to process.env for systems where loadEnv might miss system vars
  const apiKey = env.API_KEY || process.env.API_KEY || '';
  const coinGeckoKey = env.COINGECKO_API_KEY || process.env.COINGECKO_API_KEY || '';

  return {
    plugins: [react()],
    define: {
      // CRITICAL FIX: Securely inject the API Key during build.
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env.COINGECKO_API_KEY': JSON.stringify(coinGeckoKey),
      // Polyfill global for ethers/Web3 libraries. 
      // We rely on index.html script tag for this to avoid build-time var collisions.
      // 'global': 'window', 
    },
    build: {
      outDir: 'dist',
    }
  };
});
