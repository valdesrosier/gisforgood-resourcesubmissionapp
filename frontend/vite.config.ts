import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// The canonical domain model lives in ../shared and is imported via the @shared alias.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
    },
  },
  server: {
    // Proxy /api to the Functions host during local dev (or use the SWA CLI).
    proxy: { '/api': 'http://localhost:7071' },
  },
});
