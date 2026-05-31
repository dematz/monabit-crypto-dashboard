import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      '@monabit/shared-types': path.resolve(__dirname, '../../packages/shared-types/src/index.ts'),
      '@monabit/shared-utils': path.resolve(__dirname, '../../packages/shared-utils/src/index.ts'),
    },
  },
});
