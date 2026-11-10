import { defineConfig } from '@playwright/test';

const apiBase = process.env.API_BASE_URL ?? 'http://127.0.0.1:3000';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: apiBase,
    extraHTTPHeaders: { 'content-type': 'application/json' },
  },
  reporter: [['list']],
});
