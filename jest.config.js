module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-?native|react-native|@react-native-community|@ui-kitten|@eva-design|mobx-react|@react-navigation))',
  ],
  setupFiles: [
    './setupJest.js'
  ]
};
