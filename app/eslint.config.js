// https://docs.expo.dev/guides/using-eslint/

// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')
const simpleImportSort = require('eslint-plugin-simple-import-sort')
const reactCompiler = require('eslint-plugin-react-compiler')

module.exports = defineConfig([
  ...expoConfig,
  reactCompiler.configs.recommended,
  {
    ignores: ['dist/*'],
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      curly: ['error', 'all'],
    },
  },
])

// const expoConfig = require('eslint-config-expo/flat')
// const sonarjs = require('eslint-plugin-sonarjs')

// module.exports = [
//   ...expoConfig,
//   sonarjs.configs.recommended,
//   {
//     plugins: {
//       'simple-import-sort': simpleImportSort,
//     },
//     rules: {
//       'simple-import-sort/imports': 'error',
//       'simple-import-sort/exports': 'error',
//     },
//   },
//   // your other config
// ]
