module.exports = {
  extends: ['prettier', 'standard'],
  plugins: [
    'node',
    'prettier'
  ],
  env: {
    jest: true
  },
  globals: {
    name: 'off'
  },
  rules: {
    indent: ['error', 2, {
      MemberExpression: 'off'
    }],
    'no-shadow': ['error'],
    semi: [2, 'always']
  },
  overrides: [{
    files: ['**/__tests__/**/*.js', '**/cli-test-utils/**/*.js'],
    rules: {
      'node/no-extraneous-require': 'off'
    }
  }]
};
