import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
    rules: {
      // Enforce unidirectional data flow: shared -> features -> app
      // Features cannot import from each other
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            // Features cannot import from app
            {
              target: './src/features',
              from: './src/app',
              message: 'Features cannot import from app layer. Use shared components instead.',
            },
            // Shared cannot import from features or app
            {
              target: './src/components',
              from: './src/features',
              message: 'Shared components cannot import from features.',
            },
            {
              target: './src/components',
              from: './src/app',
              message: 'Shared components cannot import from app layer.',
            },
            {
              target: './src/lib',
              from: './src/features',
              message: 'Lib cannot import from features.',
            },
            {
              target: './src/lib',
              from: './src/app',
              message: 'Lib cannot import from app layer.',
            },
          ],
        },
      ],
      // Prefer named exports for better tree-shaking and refactoring
      'import/prefer-default-export': 'off',
      // Ensure imports are sorted and organized
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index',
            'type',
          ],
          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@/**',
              group: 'internal',
            },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
])
