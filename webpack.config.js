const path = require('path')
module.exports = {
    entry: "./src/controller.js",
    output: {
      filename: "bundle.js",
      path: path.resolve(__dirname, 'src')
    }
  }