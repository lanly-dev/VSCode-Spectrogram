const CopyWebpackPlugin = require('copy-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const path = require('path')
const CODICON_PATH = '@vscode/codicons/dist/'
const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  target: 'node',
  mode: 'none',
  devtool: 'inline-cheap-source-map',
  entry: './src/extension.js',
  output: {
    filename: 'extension.js',
    libraryTarget: 'commonjs2', // important
    path: path.resolve(__dirname, 'dist')
  },
  externals: {
    vscode: 'commonjs vscode'
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: require.resolve(`${CODICON_PATH}/codicon.css`) },
        { from: require.resolve(`${CODICON_PATH}/codicon.ttf`) },
        { from: 'src/controller.js' },
        { from: 'src/index.pug' },
        { from: 'src/style.css' }
      ]
    })
  ],
  optimization: {
    minimize: isProduction,
    minimizer: isProduction ? [new TerserPlugin({ extractComments: false }), new CssMinimizerPlugin()] : []
  }
}
