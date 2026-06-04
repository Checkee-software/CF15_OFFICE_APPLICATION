module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@shared-types': './src/shared-types',
        },
      },
    ],
    'react-native-reanimated/plugin'
  ],
};