import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default [
  { ignores: ['dist', 'node_modules'] },
  {
    files: ['**/*.ts', '**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: { parser: tsparser, sourceType: 'module', ecmaVersion: 2020 },
    },
    plugins: { vue, '@typescript-eslint': tseslint },
    rules: {},
  },
]
