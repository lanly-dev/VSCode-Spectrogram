'use strict'
const { Uri, ViewColumn, workspace, window } = require('vscode')
const os = require('os')
const path = require('path')
const pug = require('pug')

class SpecWebviewPanel {
  constructor(panel, extensionPath) {
    this.disposables = []
    this.panel = panel
    this.extensionPath = extensionPath

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables)
    // eslint-disable-next-line no-unused-vars
    this.panel.onDidChangeViewState(event => {}, null, this.disposables)
    // eslint-disable-next-line no-unused-vars
    this.panel.webview.onDidReceiveMessage(message => {}, null, this.disposables)
    this.panel.webview.html = this.getHtmlForWebview(extensionPath)
  }

  static createOrShow(extensionPath) {
    const column = window.activeTextEditor ? window.activeTextEditor.viewColumn : undefined

    // If we already have a panel, show it.
    if (SpecWebviewPanel.currentPanel) {
      SpecWebviewPanel.currentPanel.panel.reveal(column)
      return
    }

    const panelSetting = { enableScripts: true, enableCommandUris: true }

    if (os.platform() == 'darwin') {
      panelSetting.localResourceRoots = [Uri.file(workspace.workspaceFolders[0].uri.fsPath)]
    }

    const viewColumn = column || ViewColumn.One
    const panel = window.createWebviewPanel(SpecWebviewPanel.viewType, 'Spectrogram', viewColumn, panelSetting)
    SpecWebviewPanel.currentPanel = new SpecWebviewPanel(panel, extensionPath)
  }

  static revive(panel, extensionPath) {
    SpecWebviewPanel.currentPanel = new SpecWebviewPanel(panel, extensionPath)
  }

  dispose() {
    SpecWebviewPanel.currentPanel = undefined

    this.panel.dispose()
    while (this.disposables.length) {
      const x = this.disposables.pop()
      if (x) x.dispose()
    }
  }

  getHtmlForWebview(extensionUri) {
    const bundleUri = this.panel.webview.asWebviewUri(Uri.file(path.join(extensionUri, 'dist', 'bundle.js')))
    const styleCssUri = this.panel.webview.asWebviewUri(Uri.file(path.join(extensionUri, 'src', 'style.css')))
    const codiconsUri =  this.panel.webview.asWebviewUri(Uri.file(path.join(extensionUri, 'dist', 'codicon.css')))
    const compiledFunction = pug.compileFile(path.join(__dirname, 'index.pug'))

    return compiledFunction({ bundleUri, codiconsUri, styleCssUri, nonce: getNonce() })
  }
}

SpecWebviewPanel.currentPanel = undefined
SpecWebviewPanel.viewType = 'spec'

function getNonce() {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 32; i++) text += possible.charAt(Math.floor(Math.random() * possible.length))
  return text
}

exports.SpecWebviewPanel = SpecWebviewPanel
