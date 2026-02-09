
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Helper to find a key case-insensitively in an object
const findKey = (obj: Record<string, string>, target: string) => {
  const key = Object.keys(obj).find(k => k.toLowerCase() === target.toLowerCase());
  return key ? obj[key] : undefined;
};

import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  const processEnv = process.env;

  // ROBUST KEY LOADING: Check various names AND case-insensitive variations
  const apiKey =
    findKey(env, 'API_KEY') ||
    findKey(processEnv, 'API_KEY') ||
    findKey(env, 'GEMINI_API_KEY') ||
    findKey(processEnv, 'GEMINI_API_KEY') ||
    findKey(env, 'VITE_API_KEY') ||
    '';

  const coinGeckoKey =
    findKey(env, 'COINGECKO_API_KEY') ||
    findKey(processEnv, 'COINGECKO_API_KEY') ||
    findKey(env, 'COINGECKO_API') ||
    findKey(processEnv, 'COINGECKO_API') ||
    '';

  // Debugging logs during build/start (visible in terminal)
  console.log(`\n--- P3 PROTOCOL CONFIGURATION ---`);
  if (apiKey) {
    console.log(`✅ API Key Loaded: ${apiKey.substring(0, 4)}... (Length: ${apiKey.length})`);
  } else {
    console.warn("⚠️  API Key MISSING (Gemini AI features will be disabled)");
  }
  console.log(`---------------------------------\n`);

  return {
    plugins: [
      react(),
      nodePolyfills({
        // Whether to polyfill `node:` protocol imports.
        protocolImports: true,
      }),
    ],
    define: {
      // Securely inject the keys during build
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env.COINGECKO_API_KEY': JSON.stringify(coinGeckoKey),
    },
    build: {
      outDir: 'dist',
    }
  };
});
