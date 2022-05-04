const path = require('path')
module.exports = {
  mode: 'development',
  devtool: 'inline-cheap-source-map',
  entry: './src/controller.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
}
