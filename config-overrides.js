const { override, addDecoratorsLegacy, babelInclude, addWebpackAlias, addWebpackPlugin } = require('customize-cra');
const path = require('path');
const webpack = require('webpack');

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
    // With pnpm, node_modules structure is nested.
    // We can't rely on simple path.resolve(__dirname, 'node_modules/...') because pnpm uses symlinks
    // and the actual path might be deeper.
    // However, babel-loader usually resolves symlinks.
    // The issue might be that pnpm's strictness requires us to include the actual real paths of the packages.
    // But listing every single package path is tedious and fragile.
    // A better approach with customize-cra/babelInclude is to include 'src' and then
    // let babel process node_modules if they are explicitly included.

    // For pnpm, we might need to verify where these packages actually live or just include the root node_modules
    // but allow babel to process them.
    path.resolve(__dirname, 'node_modules'),
  ]),
  addWebpackAlias({
    'react-native': path.resolve(__dirname, 'src/react-native-patch.js'),
  }),
  addWebpackPlugin(
    new webpack.ProvidePlugin({
      React: 'react',
    })
  ),
  addWebExtensions()
);
