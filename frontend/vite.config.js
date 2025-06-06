import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()], // Enables React support
  server: {
    port: 3000, // Optional: Match CRA's default port
    open: true, // Optional: Auto-open browser
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'], // Helps with imports
  },
});