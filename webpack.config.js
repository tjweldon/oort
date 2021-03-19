const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const argv = require('yargs').argv;
const webpack = require('webpack');

// Import all app configs
const appConfig = require('./src/config/config.json'); /* Base config */
const appConfigDev = require('./src/config/config.local.json'); /* Development */

const ENV = argv.env || 'dev';

function composeConfig(env) { /* Helper function to dynamically set runtime config */
  if (env === 'dev') {
    return { ...appConfig, ...appConfigDev };
  }

  if (env === 'production') {
    return appConfig
  }
}

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
      new HtmlWebpackPlugin(),
      new webpack.DefinePlugin({
        __APP_CONFIG__: JSON.stringify(composeConfig(ENV))
      })
  ],
};


