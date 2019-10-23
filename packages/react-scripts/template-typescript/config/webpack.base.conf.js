// Reference: part of the configurations are from
// https://cesium.com/docs/tutorials/cesium-and-webpack/

'use strict';
const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const tsImportPluginFactory = require('ts-import-plugin');

const DEV = process.env.NODE_ENV === 'development';

// The path to the CesiumJS source code
// const cesiumSource = path.join(__dirname, '..', 'node_modules/cesium/Source');
// const cesiumWorkers = '../Build/Cesium/Workers';

module.exports = {
  context: __dirname,
  entry: DEV
    ? {
        app: [
          'react-hot-loader/patch',
          'webpack-dev-server/client?http://localhost:3002',
          path.resolve(__dirname, '..', 'src/boot-client.tsx'),
        ],
      }
    : {
        app: path.resolve(__dirname, '..', 'src/boot-client.tsx'),
      },
  mode: DEV ? 'development' : 'production',

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  output: {
    path: path.resolve(__dirname, '..', 'wwwroot/dist'),
    filename: 'app.bundle.js',
  },
  amd: {
    // Enable webpack-friendly use of require in Cesium
    toUrlUndefined: true,
  },
  node: {
    // Resolve node module use of fs
    fs: 'empty',
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: DEV ? 'inline-eval-cheap-source-map' : 'source-map',

  externals: {
    cesium: 'Cesium',
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: true,
      cacheGroups: {
        vendors: {
          enforce: true,
          test: /node_modules/,
          name: 'vendor',
          filename: DEV ? '[name].bundle.js' : '[name].[hash].js',
          priority: -10,
        },
      },
    },
  },

  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.tsx', '.json', '.ts', '.scss'],
  },

  module: {
    rules: [
      {
        test: /\.(png|gif|jpg|jpeg|xml|json)$/,
        exclude: [/node_modules\/proj4/, /node_modules\/antd/],
        use: ['url-loader'],
      },
      {
        test: /\.scss$/,
        exclude: [/node_modules/],
        oneOf: [
          {
            test: /\.module\.scss$/,
            use: [
              MiniCssExtractPlugin.loader,
              {
                loader: 'css-loader',
                options: {
                  modules: {
                    localIdentName: '[path][name]__[local]--[hash:base64:5]',
                  },
                  sourceMap: DEV,
                },
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: DEV,
                },
              },
            ],
          },
          {
            use: [
              MiniCssExtractPlugin.loader,
              {
                loader: 'css-loader',
                options: {
                  sourceMap: DEV,
                },
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: DEV,
                },
              },
            ],
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
            },
          },
        ],
      },
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              silent: true,
              transpileOnly: DEV ? false : true,
              getCustomTransformers: () => ({
                before: [
                  tsImportPluginFactory({
                    libraryName: 'antd',
                    libraryDirectory: 'lib',
                    style: 'css',
                  }),
                ],
              }),
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        use: ['svg-react-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '..', 'wwwroot/template.html'),
    }),
    // Copy Cesium Assets, Widgets, and Workers to a static directory
    new CopyWebpackPlugin([
      {
        from: path.resolve(
          __dirname,
          '..',
          `node_modules/cesium/Build/Cesium${!DEV ? '' : 'Unminified'}`
        ),
        to: 'cesium',
        writeToDisk: true,
      },
    ]),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '..', `src/images`),
        to: 'images',
        writeToDisk: true,
      },
    ]),
    new webpack.DefinePlugin({
      // Define relative base path in cesium for loading assets
      CESIUM_BASE_URL: JSON.stringify('/cesium'),
      LOCAL_SERVER: process.env.LOCAL_SERVER,
    }),
    new HtmlWebpackIncludeAssetsPlugin({
      append: false,
      assets: ['cesium/Widgets/widgets.css', 'cesium/Cesium.js'],
    }),

    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new WriteFilePlugin(),
  ],
};