const path = require('path')
module.exports = {
  mode: 'production',
  entry: "./src/controller.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname,'src')
  }
}