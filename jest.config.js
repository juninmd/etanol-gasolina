const path = require('path');

module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
      // Adjust pattern for pnpm nested structure
    'node_modules/(?!(.pnpm|jest-?native|react-native|@react-native-community|@ui-kitten|@eva-design|mobx-react|@react-navigation|react-native-svg))',
  ],
  setupFiles: [
    './setupJest.js'
  ],
  transform: {
    '^.+\\.(js|ts|tsx)$': 'babel-jest',
  },
  moduleDirectories: ['node_modules', path.join(__dirname, 'node_modules')],
  moduleNameMapper: {
      '^react-native$': '<rootDir>/node_modules/react-native',
  }
};
