import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Unit tests only (pure functions under lib/). Mirrors the `@/*` path alias from tsconfig.json.
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
  test: {
    include: ['lib/**/*.test.ts'],
    environment: 'node',
  },
});
