module.exports = {
  root: true,
  env: {
    browser: true,
    jest: true
  },
  parserOptions: {
    parser: 'babel-eslint',
    // specifying a module sourcetype prevent eslint from marking import statements as errors
    sourceType: 'module',
  },
  extends: [
    'airbnb-base',
  ], // activate vue related rules
  rules: {
    'comma-dangle': 'off',
    'class-methods-use-this': 'off',
    'import/no-unresolved': 'off',
    'implicit-arrow-linebreak': 'off',
    'import/prefer-default-export': 'off',
  },
};
