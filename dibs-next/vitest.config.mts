import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Unit tests only (pure functions and mocked server code under lib/, plus the CI sanity check).
// Mirrors the `@/*` path alias from tsconfig.json. This is the only Vitest config; a second
// vitest.config.ts used to exist and took precedence, which made `include` here dead code.
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
  test: {
    include: ['lib/**/*.test.ts', '__tests__/**/*.test.ts'],
    environment: 'node',
    passWithNoTests: true,
  },
});
