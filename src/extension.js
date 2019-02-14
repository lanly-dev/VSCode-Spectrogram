'use strict'
const vscode = require('vscode')
const tv = require('./treeview')
const pug = require('pug')
const path = require('path')
const jquery_path = require.resolve('jquery')
const semjs_path = require.resolve('semantic-ui-css')
let semcss_path = require.resolve('semantic-ui-css/semantic.min.css');

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
  const vue_template_uri = (vscode.Uri.file(path.join(context.extensionPath, 'src', 'vue_template.js'))).with({scheme: 'vscode-resource'})
  const song_path = (vscode.Uri.file(path.join(context.extensionPath, 'angel.mp3'))).with({scheme: 'vscode-resource'})
  const sk_uri = (vscode.Uri.file(path.join(context.extensionPath, 'src', 'bundle.js'))).with({scheme: 'vscode-resource'})
  const semjs_uri = (vscode.Uri.file(semjs_path)).with({scheme: 'vscode-resource'})
  const semcss_uri = (vscode.Uri.file(semcss_path)).with({scheme: 'vscode-resource'})
  const jquery_uri = (vscode.Uri.file(jquery_path)).with({scheme: 'vscode-resource'})

  wv.webview.html = compiledFunction({
    sk_uri: sk_uri,
    semjs_uri: semjs_uri,
    semcss_uri: semcss_uri,
    vue_uri: vue_template_uri,
    jquery_uri: jquery_uri,
    song_path: song_path,
    nonce: '123'
  })
}
exports.activate = activate

function deactivate() {}

module.exports = {
  activate,
  deactivate
}
