import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Environment
    environment: 'happy-dom',
    globals: true,

    // Test file patterns
    include: ['src/**/*.{test,spec}.{ts,tsx}', '__tests__/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],

    // Execution
    pool: 'forks',
    testTimeout: 10000,
    hookTimeout: 10000,

    // Reporters
    reporters: ['default', 'json'],
    outputFile: {
      json: './test-results/unit-test-results.json',
    },

    // Coverage
    coverage: {
      provider: 'v8',
      enabled: false,
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/app/**/lib/**/*.ts',
        'src/app/**/utils/**/*.ts',
        'src/app/**/hooks/**/*.ts',
        'src/lib/**/*.ts',
        'src/hooks/**/*.ts',
      ],
      exclude: [
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/types/**',
        '**/data/**',
      ],
    },

    // Setup files
    setupFiles: ['./vitest.setup.ts'],

    // Mocking behavior
    clearMocks: true,
    restoreMocks: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
