
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Using process.cwd() is standard and reliable in most environments.
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

  // Debugging logs during build/start (visible in terminal)
  console.log(`--- P3 BUILD CONFIG ---`);
  if (apiKey) {
    console.log(`✅ Gemini API Key found (${apiKey.length} chars)`);
  } else {
    console.warn("⚠️  Gemini API Key MISSING");
  }

  if (googleClientId) {
    console.log(`✅ Google Client ID found (${googleClientId.length} chars)`);
  } else {
    console.warn("⚠️  Google Client ID MISSING (Login will default to Demo Mode)");
  }
  console.log(`-----------------------`);

  return {
    plugins: [react()],
    define: {
      // CRITICAL FIX: Securely inject the keys during build.
      // We default to empty string to prevent "undefined" string literal issues.
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env.COINGECKO_API_KEY': JSON.stringify(coinGeckoKey),
      'process.env.GOOGLE_CLIENT_ID': JSON.stringify(googleClientId),
    },
    build: {
      outDir: 'dist',
    }
  };
});
