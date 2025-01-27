import globals from 'globals'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.commonjs,
        ...globals.node,
        ...globals.mocha,
        ...globals.browser
      },
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    rules: {
      'comma-dangle': ['error', 'never'],
      'eol-last': ['error', 'always'],
      'max-len': ['error', { code: 120 }],
      'no-throw-literal': 'warn',
      'no-trailing-spaces': 'error',
      'quote-props': ['error', 'as-needed'],
      'constructor-super': 'warn',
      'no-const-assign': 'warn',
      'no-this-before-super': 'warn',
      'no-undef': 'warn',
      'no-unreachable': 'warn',
      'no-unused-vars': 'warn',
      'valid-typeof': 'warn',
      curly: ['error', 'multi-or-nest'],
      eqeqeq: 'error',
      indent: ['error', 2],
      quotes: ['error', 'single', { allowTemplateLiterals: true }],
      semi: ['error', 'never']
    }
  }]
