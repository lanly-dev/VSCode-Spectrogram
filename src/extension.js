'use strict'
const vscode = require('vscode')
const { TreeView } = require('./treeView')
const wv = require('./webview')

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const specExplorer = TreeView.create(context)
  specExplorer.onDidChangeSelection(file => {
    try {
      file.selection[0].fullFilePath
    } catch (error) {
      vscode.window.showInformationMessage('Slow down 😵')
      return
    }
    const { fullFilePath } = file.selection[0]
    if (fullFilePath.indexOf('.mp3') === -1) return

    const label = file.selection[0].label.replace('.mp3', '')
    const songPath = vscode.Uri.file(fullFilePath)
    wv.SpecWebviewPanel.createOrShow(context.extensionPath)
    const panel = wv.SpecWebviewPanel.currentPanel.panel.webview.asWebviewUri(songPath)
    wv.SpecWebviewPanel.currentPanel.panel.webview.postMessage({ path: `${panel}`, name: label })
    wv.SpecWebviewPanel.currentPanel.panel.webview.onDidReceiveMessage(
      response => {
        if (response.type == 'finished') vscode.window.showInformationMessage('Finished Playing 😎')
        else if (response.type == 'error') vscode.window.showErrorMessage(`${response.message} 😵`)
      },
      undefined,
      context.subscriptions
    )
  })
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}
