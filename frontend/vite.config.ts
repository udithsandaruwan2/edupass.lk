/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5174,
    // If 5174 is busy, Vite picks 5175, 5176, …
    strictPort: false,
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: false,
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Long-lived vendor chunk so app releases don't bust the React cache
        manualChunks: { vendor: ['react', 'react-dom', 'react-router'] },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    exclude: ['**/node_modules/**', '**/e2e/**', '**/dist/**'],
  },
})
