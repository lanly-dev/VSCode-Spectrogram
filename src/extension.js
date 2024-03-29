'use strict'
const path = require('path')
// @ts-ignore
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
    const format = fullFilePath.split('.').pop()
    if (!['flac', 'mp3'].includes(format)) return

    const label = path.parse(file.selection[0].label).name
    const songPath = Uri.file(fullFilePath)
    SpecWebviewPanel.createOrShow(context.extensionPath)
    const panel = SpecWebviewPanel.currentPanel.panel.webview.asWebviewUri(songPath)
    SpecWebviewPanel.currentPanel.panel.webview.postMessage({ path: `${panel}`, name: label })
    SpecWebviewPanel.currentPanel.panel.webview.onDidReceiveMessage(
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
