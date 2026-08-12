import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist', 'coverage', 'node_modules'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, react.configs.flat.recommended],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      curly: 'warn',
      'default-case': 'warn',
      'default-case-last': 'warn',
      'default-param-last': 'off',
      'dot-notation': 'warn',
      eqeqeq: 'warn',
      'max-classes-per-file': ['error', 1],
      'no-case-declarations': 'off',
      'no-console': 'warn',
      'no-constructor-return': 'warn',
      'no-duplicate-imports': 'warn',
      'no-else-return': 'warn',
      'no-empty-function': 'off',
      'no-extra-bind': 'warn',
      'no-extra-boolean-cast': 'off',
      'no-floating-decimal': 'warn',
      'no-multi-spaces': 'warn',
      'react/display-name': 'off',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'sort-keys': 'warn',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: false,
          allowTypedFunctionExpressions: true,
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
);
