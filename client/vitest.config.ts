import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test/setup.js'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'lcov'],
    },
    include: ['src/**/*.test.{js,jsx,ts,tsx}', 'src/**/?(*.)+(spec|test).{js,jsx,ts,tsx}'],
  },
});
