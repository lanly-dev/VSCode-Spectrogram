'use strict'
const vscode = require('vscode')
const tv = require('./treeview')
const wv = require('./webview')
const path = require('path')

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  vscode.window.showInformationMessage('Hello World!')

  const specTV = new tv.Treeview(context)

  specTV.specExplorer.onDidChangeSelection(file => {
    const fullFilePath = file.selection[0].fullFilePath
    if (fullFilePath.indexOf('.mp3') != -1) {
      const song_path = vscode.Uri.file(fullFilePath).with({ scheme: 'vscode-resource' })
      wv.SpecWebviewPanel.createOrShow(context.extensionPath)
      wv.SpecWebviewPanel.currentPanel.panel.postMessage(`${song_path}`)
      wv.SpecWebviewPanel.currentPanel.panel.webview.onDidReceiveMessage(
        message => {
          if(message == 'ready')
            wv.SpecWebviewPanel.currentPanel.panel.postMessage(`${song_path}`)
        },
        undefined,
        context.subscriptions
      )
    }
  })
}
exports.activate = activate

function deactivate() {}

module.exports = {
  activate,
  deactivate
}
