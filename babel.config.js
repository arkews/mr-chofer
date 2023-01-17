module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['nativewind/babel'],
      ['module:react-native-dotenv'],
      [
        'module-resolver',
        {
          alias: {
            '@base': '.',
            '@components': './components',
            '@constants': './constants',
            '@hooks': './hooks',
            '@navigation': './navigation',
            '@screens': './screens'
          }
        }
      ]
    ]
  }
}
