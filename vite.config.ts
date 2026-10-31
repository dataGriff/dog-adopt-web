import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: 5173 },
  build: {
    rollupOptions: {
      output: {
        // Keep framework code in its own long-cached chunk. @dogadopt/contracts
        // currently brings zod along (no sideEffects: false yet), so it goes
        // in the vendor chunk too rather than in every page.
        manualChunks(id: string) {
          if (id.includes('node_modules/@dogadopt/contracts') || id.includes('node_modules/zod') || id.includes('node_modules/openapi-fetch')) return 'contracts';
          if (/node_modules\/(react|react-dom|react-router|@tanstack|scheduler)\//.test(id)) return 'react';
          return undefined;
        },
      },
    },
  },
});
