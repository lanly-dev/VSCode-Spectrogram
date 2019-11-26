'use strict'
const path = require('path')
const pug = require('pug')
const vscode = require('vscode')
const os = require('os')

class SpecWebviewPanel {
  constructor(panel, extensionPath) {
    this.disposables = []
    this.panel = panel
    this.extensionPath = extensionPath

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables)
    this.panel.onDidChangeViewState(event => {}, null, this.disposables)
    this.panel.webview.onDidReceiveMessage(message => {}, null, this.disposables)
    this.panel.webview.html = this.getHtmlForWebview(extensionPath)
  }

  static createOrShow(extensionPath) {
    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined

    // If we already have a panel, show it.
    if (SpecWebviewPanel.currentPanel) {
      SpecWebviewPanel.currentPanel.panel.reveal(column)
      return
    }

    const panelSetting = { enableScripts: true }

    if (os.platform() == 'darwin') panelSetting.localResourceRoots = [vscode.Uri.file(vscode.workspace.workspaceFolders[0].uri.fsPath)]

    const panel = vscode.window.createWebviewPanel(SpecWebviewPanel.viewType, 'Spectrogam', column || vscode.ViewColumn.One, panelSetting)
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

  getHtmlForWebview(extensionPath) {

    const bundle_uri = vscode.Uri.file(path.join(extensionPath, 'src', 'bundle.js')).with({ scheme: 'vscode-resource' })
    const style_css_uri = vscode.Uri.file(path.join(extensionPath, 'src', 'style.css')).with({ scheme: 'vscode-resource' })
    const compiledFunction = pug.compileFile(path.join(__dirname, 'index.pug'))

    return compiledFunction({
      bundle_uri: bundle_uri,
      style_css_uri: style_css_uri,
      nonce: getNonce()
    })
  }
}

SpecWebviewPanel.currentPanel = undefined
SpecWebviewPanel.viewType = 'spec'

function getNonce() {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

exports.SpecWebviewPanel = SpecWebviewPanel