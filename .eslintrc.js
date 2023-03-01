module.exports = {
  root: true,

  env: {
    node: true
  },

  extends: [
    'plugin:vue/vue3-essential'
    // '@vue/standard'
  ],

  parserOptions: {
    parser: '@babel/eslint-parser'
  },

  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'space-before-function-paren': 0,
    'vue/multi-word-component-names': 0,
    'vue/no-unused-vars': 'warn'
  },

  'extends': [
    'plugin:vue/vue3-essential',
    '@vue/standard'
  ]
}
