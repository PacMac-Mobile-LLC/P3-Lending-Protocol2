import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/unit/**/*.spec.ts'],
    setupFiles: ['tests/setup.ts'],
    restoreMocks: true,
    clearMocks: true,
  },
});
