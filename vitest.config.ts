import { defineConfig } from 'vitest/config';

/**
 * Unit tests live next to the code under src/ as *.test.ts. The e2e/ folder is
 * Playwright (its own runner) — scope Vitest to src so `npm test` never tries
 * to execute a Playwright spec and fail with "did not expect test.describe()".
 */
export default defineConfig({
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
