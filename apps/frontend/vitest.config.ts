import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@monabit/shared-types': path.resolve(__dirname, '../../packages/shared-types/src/index.ts'),
      '@monabit/shared-utils': path.resolve(__dirname, '../../packages/shared-utils/src/index.ts'),
    },
  },
});
