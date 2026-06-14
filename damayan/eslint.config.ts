// @ts-ignore
import expoConfig from 'eslint-config-expo/flat';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  ...expoConfig,
  {
    ignores: ['coverage/**', 'node_modules/**'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/array-type': 'off',
      'react/no-unescaped-entities': 'off',
      'import/no-named-as-default': 'off',
      'import/no-duplicates': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
]);
