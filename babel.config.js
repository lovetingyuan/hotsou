module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: ['./scripts/babel-plugin-function-source.js', 'transform-remove-console'],
  }
}
