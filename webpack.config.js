const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CODICON_PATH = '@vscode/codicons/dist/'
module.exports = {
  mode: 'development',
  devtool: 'inline-cheap-source-map',
  entry: './src/controller.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: require.resolve(`${CODICON_PATH}/codicon.css`), to: '[name].css' },
        { from: require.resolve(`${CODICON_PATH}/codicon.ttf`), to: '[name].ttf' }
      ]
    })
  ]
}
