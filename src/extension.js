'use strict'
const { ExtensionContext, Uri, window } = require('vscode')
const { TreeView } = require('./treeView')
const { SpecWebviewPanel } = require('./webview')

/**
 * @param {ExtensionContext} context
 */
function activate(context) {
  const specExplorer = TreeView.create(context)
  specExplorer.onDidChangeSelection(file => {
    try {
      file.selection[0].fullFilePath
    } catch (error) {
      window.showInformationMessage('Slow down 😵')
      return
    }
    const { fullFilePath } = file.selection[0]
    if (fullFilePath.indexOf('.mp3') === -1) return

    const label = file.selection[0].label.replace('.mp3', '')
    const songPath = Uri.file(fullFilePath)
    SpecWebviewPanel.createOrShow(context.extensionPath)
    const { asWebviewUri, postMessage, onDidReceiveMessage } = SpecWebviewPanel.currentPanel.panel.webview
    const panel = asWebviewUri(songPath)
    postMessage({ path: `${panel}`, name: label })
    onDidReceiveMessage(
      ({ type, message }) => {
        if (type == 'finished') window.showInformationMessage('Finished Playing 😎')
        else if (type == 'error') window.showErrorMessage(`${message} 😵`)
      },
      undefined,
      context.subscriptions
    )
  })
}

function deactivate() {}

module.exports = { activate, deactivate }
