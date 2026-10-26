module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(.pnpm|jest-?native|react-native|@react-native|@react-native-community|expo|@expo))',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/android/'],
  collectCoverageFrom: [
    'src/lib/**/*.ts',
    'src/services/**/*.ts',
    'scripts/anp.js',
    'scripts/xlsx.js',
  ],
};
