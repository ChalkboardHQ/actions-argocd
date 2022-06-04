module.exports = {
  env: {
    browser: true,
  },
  extends: [
    'airbnb-base',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    indent: ['error', 2],
    'import/prefer-default-export': 'off',
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'no-shadow': 'off',
    'class-methods-use-this': 'off',
    'no-array-constructor': 'off',
  },
};
