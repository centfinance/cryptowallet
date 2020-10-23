module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module',
  },
  env: {
    browser: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
    'plugin:vue/recommended',
  ],
  plugins: [
    'vue','import-order-autofix'
  ],
  globals: {
    cordova: true,
    ContactFindOptions: true,
    jest: true,
    sms: true,
    QRScanner: true,
    StatusBar: true,
    IRoot: true,
    NavigationBar: true,
  },
  rules: {
    'vue/require-default-prop': 0,
    'no-param-reassign': 0,
    'import/first': 0,
    'import/named': 2,
    'import/namespace': 2,
    'import/default': 2,
    'import/export': 2,
    'import/prefer-default-export': 0,
    'import/extensions': 0,
    'import/no-unresolved': 0,
    'import/no-extraneous-dependencies': 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'arrow-body-style': ['error', 'always'],
    'vue/component-name-in-template-casing': 0,
    'curly': [2, 'all'],
    'no-magic-numbers': ['error', {'ignore': [-1, 0, 1, 2, 10, 420], 'ignoreArrayIndexes': true }],
    'linebreak-style': 0,
    'import-order-autofix/order': 2
  },
};
