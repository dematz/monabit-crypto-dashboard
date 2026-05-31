import { fileURLToPath } from 'node:url';
import path from 'node:path';
import rootConfig from '../../eslint.config.js';
import tseslint from 'typescript-eslint';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  ...rootConfig,
  { ignores: ['*.config.*'] },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: { project: './tsconfig.json', tsconfigRootDir: __dirname },
    },
    rules: {
      ...tseslint.configs.strictTypeChecked.rules,
      '@typescript-eslint/no-unnecessary-condition': 'error',
      'no-console': 'error',
    },
  },
);
