const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: [
    './client/index.js',
  ],
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: '/',
    filename: 'bundle.js',
  },
  mode: process.env.NODE_ENV,
  module: {
    rules: [
      {
        test: /\.jsx?/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.(css|scss)$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname),
      publicPath: '/'
    },
    proxy: {
      '/': {
        target: 'http://localhost:3000',
        secure: false,
      },
      '/api/leaders': {
        target: 'http://localhost:3000',
        secure: false,
      },
      '/redirectSpotify': {
        target: 'http://localhost:3000',
        secure: false,
      },
      '/getAccessToken': {
        target: 'http://localhost:3000',
        secure: false,
      },
      '/login': {
        target: 'http://localhost:3000',
        secure: false,
      },
      '/callback': {
        target: 'http://localhost:3000',
        secure: false,
      },
      '/refresh_token': {
        target: 'http://localhost:3000',
        secure: false,
      },
      '/api': {
        target: 'http://localhost:3000',
        secure: false,
      },
      '/playlists': {
        target: 'http://localhost:3000',
        secure: false,
      },

    }
  }
  
}