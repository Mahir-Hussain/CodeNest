import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  build: {
    outDir: 'dist', // Vercel expects 'dist' by default
    emptyOutDir: true
  },
  // Fix for React Router DOM (SPA fallback)
  assetsInclude: ['**/*.html'],
  base: '/', // Set to root for Vercel deployment
});
