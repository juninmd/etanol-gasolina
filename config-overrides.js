const { override, addDecoratorsLegacy, babelInclude, addWebpackAlias } = require('customize-cra');
const path = require('path');

const addWebExtensions = () => (config) => {
  const extensions = config.resolve.extensions;
  // Prioritize web extensions
  const webExtensions = extensions.map(ext => '.web' + ext).filter(ext => !extensions.includes(ext));
  config.resolve.extensions = ['.web.ts', '.web.tsx', '.web.js', '.web.jsx', ...extensions];
  return config;
};

module.exports = override(
  addDecoratorsLegacy(),
  babelInclude([
    path.resolve(__dirname, 'src'),
    path.resolve(__dirname, 'node_modules/@ui-kitten'),
    path.resolve(__dirname, 'node_modules/@eva-design'),
    path.resolve(__dirname, 'node_modules/react-native-svg'),
    path.resolve(__dirname, 'node_modules/react-native-gesture-handler'),
    path.resolve(__dirname, 'node_modules/react-native-reanimated'),
    path.resolve(__dirname, 'node_modules/react-native-screens'),
    path.resolve(__dirname, 'node_modules/@react-navigation'),
    path.resolve(__dirname, 'node_modules/react-native-safe-area-context'),
    path.resolve(__dirname, 'node_modules/@react-native-community'),
    path.resolve(__dirname, 'node_modules/mobx-react'),
    path.resolve(__dirname, 'node_modules/react-native-maps'),
  ]),
  addWebpackAlias({
    'react-native': path.resolve(__dirname, 'src/react-native-patch.js'),
  }),
  addWebExtensions()
);
