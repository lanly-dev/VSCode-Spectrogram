const CopyWebpackPlugin = require('copy-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const path = require('path')
const CODICON_PATH = '@vscode/codicons/dist/'

module.exports = (env, argv) => {
  const { devtool, mode} = argv
  console.log('🥼🥼', 'MODE -->', mode, '🥼🥼')
  return {
    target: 'node',
    mode,
    devtool,
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
      minimize: mode === 'production',
      minimizer: mode === 'production' ? [new TerserPlugin({ extractComments: false }), new CssMinimizerPlugin()] : []
    }
  }
}
