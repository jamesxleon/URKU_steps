const webpack = require('webpack');
const path = require('path');

module.exports = function override(config, env) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "buffer": require.resolve("buffer"),
    "timers": require.resolve("timers-browserify"),
    "stream": require.resolve("stream-browserify"),
    "util": require.resolve("util/"),
    "assert": require.resolve("assert/"),
    "process": require.resolve("process/browser"),
    "zlib": require.resolve("browserify-zlib"),
    "path": require.resolve("path-browserify"),
  };

  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ];

  config.resolve.alias = {
    ...config.resolve.alias,
    'process/browser': path.resolve(__dirname, 'node_modules', 'process', 'browser.js'),
  };

  return config;
}