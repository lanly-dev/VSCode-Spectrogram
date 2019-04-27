'use strict'
const vscode = require('vscode')
const tv = require('./treeview')
const pug = require('pug')
const path = require('path')
const jquery_path = require.resolve('jquery')
const semjs_path = require.resolve('semantic-ui-css')
const semcss_path = require.resolve('semantic-ui-css/semantic.min.css');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  vscode.window.showInformationMessage('Hello World!')
  // let files = vscode.workspace.findFiles('**/*', null, 100)
  // files.then(data => console.log(data), error => console.error(error))

  const test = new tv.Treeview(context)

  test.specViewer.onDidChangeSelection(file => {
    console.log(file)
    console.log(test.specViewer.selection)
  })


  // vscode.workspace.onDidChangeConfiguration()

  const compiledFunction = pug.compileFile(`${__dirname}\\index.pug`)

  const wv = vscode.window.createWebviewPanel('something','Cat Coding', vscode.ViewColumn.One, {
    // Enable javascript in the webview
    enableScripts: true,
    // And restric the webview to only loading content from our extension's `media` directory.
    // localResourceRoots: [vscode.Uri.file(path.join(extensionPath, 'media'))]
  })
  const song_path = (vscode.Uri.file(path.join(context.extensionPath, 'beat.mp3'))).with({scheme: 'vscode-resource'})
  const bundle_uri = (vscode.Uri.file(path.join(context.extensionPath, 'src', 'bundle.js'))).with({scheme: 'vscode-resource'})
  const ctmcss_uri = (vscode.Uri.file(path.join(context.extensionPath, 'src', 'custom.css'))).with({scheme: 'vscode-resource'})
  const semjs_uri = (vscode.Uri.file(semjs_path)).with({scheme: 'vscode-resource'})
  const semcss_uri = (vscode.Uri.file(semcss_path)).with({scheme: 'vscode-resource'})
  const jquery_uri = (vscode.Uri.file(jquery_path)).with({scheme: 'vscode-resource'})

  wv.webview.html = compiledFunction({
    bundle_uri: bundle_uri,
    jquery_uri: jquery_uri,
    semjs_uri: semjs_uri,
    semcss_uri: semcss_uri,
    ctmcss_uri: ctmcss_uri,
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
