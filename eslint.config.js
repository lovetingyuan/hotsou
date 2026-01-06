// https://docs.expo.dev/guides/using-eslint/

// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')
const simpleImportSort = require('eslint-plugin-simple-import-sort')

module.exports = defineConfig([
  expoConfig,
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
