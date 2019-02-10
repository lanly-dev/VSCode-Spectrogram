const path = require('path')
module.exports = {
    entry: "./src/sketch.js",
    output: {
      filename: "bundle.js",
      path: path.resolve(__dirname, 'src')
    }
  }