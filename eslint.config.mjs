// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config({
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      'prefer-const': 'off',
      'no-useless-escape': 'off'
    },
  });