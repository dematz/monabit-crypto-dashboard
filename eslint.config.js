import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import ts from 'typescript-eslint';

export default [
  { ignores: ['**/dist/**', '**/node_modules/**', '**/.git/**', '**/tmp/**'] },
  ...ts.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    plugins: { prettier },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'warn',
    },
  },
];
