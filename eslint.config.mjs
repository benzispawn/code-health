import path from 'path';
import tseslint from '@typescript-eslint/eslint-plugin';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default [
  {
    ignores: ['eslint.config.mjs', '.dependency-cruiser.js', 'dist/**', 'coverage/**', 'node_modules/**'],
  },
  ...tseslint.configs['flat/recommended'],
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        project: [path.resolve(import.meta.dirname, './tsconfig.spec.json')],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/await-thenable': 'warn',
      "prettier/prettier": ["error", { endOfLine: "auto" }],
      "no-empty": ["error", { "allowEmptyCatch": false }],
      "no-unsafe-finally": "error",
      "no-throw-literal": "error",
      "require-await": "error",
    },
  },
];
