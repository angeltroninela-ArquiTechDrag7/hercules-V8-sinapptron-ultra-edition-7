import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  // Check both API_KEY and GEMINI_API_KEY to help the user
  const resolvedKey = env.API_KEY || env.GEMINI_API_KEY || '';

  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(resolvedKey)
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});