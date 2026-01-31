import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // This allows the build to access local .env files or Netlify Environment Variables.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // CRITICAL FIX: This replaces 'process.env.API_KEY' in your source code
      // with the actual string value of the variable during the build.
      // This prevents "ReferenceError: process is not defined" in the browser.
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    build: {
      outDir: 'dist',
    }
  };
});