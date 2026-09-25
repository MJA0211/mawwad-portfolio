import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    files: ['cloudflare/*.mjs', 'tests/*.test.mjs'],
    languageOptions: {
      globals: {
        Request: 'readonly',
        Response: 'readonly',
        Headers: 'readonly',
        URL: 'readonly',
        ReadableStream: 'readonly',
        TextEncoder: 'readonly',
      },
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'project1/**',
      'project 2/**',
      'EICC PROJECT/**',
      'failurelab/**',
      '.local/**',
      'test-results/**',
      'playwright-report/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['scripts/*.mjs'],
    languageOptions: {
      globals: { console: 'readonly', process: 'readonly', URL: 'readonly', document: 'readonly' },
    },
  },
);
