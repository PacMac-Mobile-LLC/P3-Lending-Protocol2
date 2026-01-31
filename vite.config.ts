import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The third parameter '' ensures we load all env vars, not just those prefixed with VITE_
  const env = loadEnv(mode, process.cwd(), '');
  
  // Fallback to process.env for systems where loadEnv might miss system vars (though loadEnv usually catches them)
  const apiKey = env.API_KEY || process.env.API_KEY || '';

  return {
    plugins: [react()],
    define: {
      // CRITICAL FIX: Securely inject the API Key during build.
      // If the key is missing, it injects an empty string to prevent ReferenceErrors.
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
    build: {
      outDir: 'dist',
    }
  };
});