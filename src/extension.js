'use strict'
const vscode = require('vscode')
const tv = require('./treeview')
const pug = require('pug')
const path = require('path')
const p5_path = require.resolve('p5')

// const p5 = require('p5')
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  vscode.window.showInformationMessage('Hello World!')
  // let files = vscode.workspace.findFiles('**/*', null, 100)
  // files.then(data => console.log(data), error => console.error(error))
  
  const test = new tv.Treeview

  test.audiosViewer.onDidChangeSelection((one, two, three) => {
    console.log(one, two, three)
  })
  // vscode.workspace.onDidChangeConfiguration()

  const compiledFunction = pug.compileFile(`${__dirname}\\index.pug`)

  const wv = vscode.window.createWebviewPanel('something','Cat Coding', vscode.ViewColumn.One, {
    // Enable javascript in the webview
    enableScripts: true,
    // And restric the webview to only loading content from our extension's `media` directory.
    // localResourceRoots: [vscode.Uri.file(path.join(extensionPath, 'media'))]
  })
  console.log(p5_path)
  const vue_template_uri = (vscode.Uri.file(path.join(context.extensionPath, 'src', 'vue_template.js'))).with({scheme: 'vscode-resource'})
  const sk_uri = (vscode.Uri.file(path.join(context.extensionPath, 'src', 'sketch.js'))).with({scheme: 'vscode-resource'})
  const p5_uri = (vscode.Uri.file(p5_path)).with({scheme: 'vscode-resource'})
  wv.webview.html = compiledFunction({
    p5_uri: p5_uri,
    sk_uri: sk_uri,
    vue_uri: vue_template_uri, 
    nonce: '123'
  })
}
exports.activate = activate

function deactivate() {}

module.exports = {
  activate,
  deactivate
}
