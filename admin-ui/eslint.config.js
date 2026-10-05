// eslint.config.js (or .cjs)
import { defineConfig } from 'eslint/config'
import vue from 'eslint-plugin-vue'
import ts from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'
import promisePlugin from 'eslint-plugin-promise'
import sonarjsPlugin from 'eslint-plugin-sonarjs'
import casePolice from 'eslint-plugin-case-police'
import regexpPlugin from 'eslint-plugin-regexp'
import vueParser from 'vue-eslint-parser'

export default defineConfig([
  // Global igonres
  {
    ignores: [
      'src/plugins/iconify/*.js',
      'node_modules/**',
      'dist/**',
      '*.d.ts',
      'vendor/**',
      '*.json',
      // Ignore config/build files from being linted as source
      'eslint.config.*',
      'vite.config.*',
      'postcss.config.*',
      'tailwind.config.*',
      'tsup.config.*',
    ],
  },

  // Apply Vue and TypeScript flat recommended configs
  ...ts.configs.recommended,
  ...vue.configs['flat/recommended'],

  // Project rules and plugins (do not override parser for .vue files)
  {
    files: ['**/*.{js,jsx,ts,tsx,vue}'],

    plugins: {
      import: importPlugin,
      promise: promisePlugin,
      sonarjs: sonarjsPlugin,
      'case-police': casePolice,
      regexp: regexpPlugin,
    },

  rules: {
      'no-console': 'warn',
      'no-debugger': 'warn',

      'comma-spacing': ['error', { before: false, after: true }],
      'key-spacing': ['error', { afterColon: true }],
      'n/prefer-global/process': 'off',
      'sonarjs/cognitive-complexity': 'off',

      'vue/first-attribute-linebreak': ['error', {
        singleline: 'beside',
        multiline: 'below',
      }],

      'antfu/top-level-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      'indent': ['error', 2],
      'comma-dangle': ['error', 'always-multiline'],
      'object-curly-spacing': ['error', 'always'],
      camelcase: 'off',
      'max-len': 'off',
      semi: ['error', 'never'],
      'arrow-parens': ['error', 'as-needed'],
      'newline-before-return': 'error',

      'lines-around-comment': [
        'error',
        {
          beforeBlockComment: true,
          beforeLineComment: true,
          allowBlockStart: true,
          allowClassStart: true,
          allowObjectStart: true,
          allowArrayStart: true,
          ignorePattern: '!SECTION',
        },
      ],

      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_+$', argsIgnorePattern: '^_+$' }],
      'array-element-newline': ['error', 'consistent'],
      'array-bracket-newline': ['error', 'consistent'],

      'vue/multi-word-component-names': 'off',

      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'expression', next: 'const' },
        { blankLine: 'always', prev: 'const', next: 'expression' },
        { blankLine: 'always', prev: 'multiline-const', next: '*' },
        { blankLine: 'always', prev: '*', next: 'multiline-const' },
      ],

      'import/prefer-default-export': 'off',
      'import/newline-after-import': ['error', { count: 1 }],
      'no-restricted-imports': [
        'error',
        'vuetify/components',
        {
          name: 'vue3-apexcharts',
          message: 'apexcharts are auto imported',
        },
      ],
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
          vue: 'always',
        },
      ],
      'import/no-unresolved': ['error', {
        ignore: [
          '~pages$',
          'virtual:generated-layouts',
          '#components$',
          '.*\\?raw',
          '#auth$',
        ],
      }],

      '@typescript-eslint/no-shadow': 'error',
  '@typescript-eslint/consistent-type-imports': 'off',

      'promise/always-return': 'off',
      'promise/catch-or-return': 'off',

      'vue/block-tag-newline': 'error',
      'vue/component-api-style': 'error',
      'vue/component-name-in-template-casing': ['error', 'PascalCase', { registeredComponentsOnly: false, ignores: ['/^swiper-/'] }],
      // Allow existing kebab-case events used widely in the project
      'vue/custom-event-name-casing': ['off', 'camelCase'],
      'vue/define-macros-order': 'error',
      'vue/html-comment-content-newline': 'error',
      'vue/html-comment-content-spacing': 'error',
      'vue/html-comment-indent': 'error',
      'vue/match-component-file-name': 'error',
      'vue/no-child-content': 'error',
      'vue/require-default-prop': 'off',

      'vue/no-duplicate-attr-inheritance': 'error',
      'vue/no-empty-component-block': 'error',
      'vue/no-multiple-objects-in-class': 'error',
      'vue/no-reserved-component-names': 'error',
      'vue/no-template-target-blank': 'error',
      'vue/no-useless-mustaches': 'error',
      'vue/no-useless-v-bind': 'error',
      'vue/padding-line-between-blocks': 'error',
      'vue/prefer-separate-static-class': 'error',
      'vue/prefer-true-attribute-shorthand': 'error',
      'vue/v-on-function-call': 'error',
      'vue/no-restricted-class': ['error', '/^(p|m)(l|r)-/'],
      'vue/valid-v-slot': ['error', { allowModifiers: true }],

      'vue/no-irregular-whitespace': 'error',
      'vue/template-curly-spacing': 'error',

      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/no-nested-template-literals': 'off',
    },

    settings: {
      'import/resolver': {
        // Resolve Node modules and respect .ts/.vue without extensions
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts', '.vue'],
        },
        // Use TS resolver so paths from tsconfig are picked up
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.json'],
        },
        // Mirror Vite aliases so eslint-plugin-import can resolve them
        alias: {
          map: [
            ['@', './src'],
            ['@core', './src/@core'],
            ['@views', './src/views'],
            ['@assets', './src/assets'],
            ['@services', './src/services'],
            ['@styles', './src/assets/styles'],
            ['@themeConfig', './themeConfig.ts'],
            ['@theme-variables', './src/assets/styles/variables/_template.scss'],
          ],
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue', '.json', '.d.ts'],
        },
      },
    },
  },

  // JS/TS-specific parser and globals (avoid affecting .vue files)
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: ts.parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: false,
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        process: 'readonly',
      },
    },
  },

  // Vue SFC-specific parser setup to enable TS inside <script setup lang="ts">
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
        parser: ts.parser,
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        process: 'readonly',
      },
    },
  },
])
