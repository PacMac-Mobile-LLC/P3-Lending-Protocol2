
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // ROBUST KEY LOADING: Check various common names for the API Key
  const apiKey = 
    env.API_KEY || 
    process.env.API_KEY || 
    env.VITE_API_KEY || 
    process.env.VITE_API_KEY || 
    env.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    '';

  const coinGeckoKey = env.COINGECKO_API_KEY || process.env.COINGECKO_API_KEY || '';
  
  // ROBUST ID LOADING: Check various common names for the Client ID
  const googleClientId = 
    env.GOOGLE_CLIENT_ID || 
    process.env.GOOGLE_CLIENT_ID || 
    env.CLIENT_ID || 
    process.env.CLIENT_ID || 
    env.VITE_GOOGLE_CLIENT_ID || 
    env.VITE_CLIENT_ID ||
    '';

  // Debugging logs during build/start
  if (apiKey) {
    console.log(`✅ Gemini API Key loaded: ${apiKey.substring(0, 4)}...`);
  } else {
    console.warn("⚠️  WARNING: Gemini API Key not found. AI features will be disabled.");
  }

  if (googleClientId) {
    console.log(`✅ Google Client ID loaded: ${googleClientId.substring(0, 10)}...`);
  } else {
    console.warn("⚠️  WARNING: Google Client ID not found. Login will fail.");
  }

  return {
    plugins: [react()],
    define: {
      // CRITICAL FIX: Securely inject the API Key during build.
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env.COINGECKO_API_KEY': JSON.stringify(coinGeckoKey),
      'process.env.GOOGLE_CLIENT_ID': JSON.stringify(googleClientId),
    },
    build: {
      outDir: 'dist',
    }
  };
});
