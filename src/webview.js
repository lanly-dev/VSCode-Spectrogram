'use strict'
const path = require('path')
const pug = require('pug')
const vscode = require('vscode')

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

    const panel = vscode.window.createWebviewPanel(SpecWebviewPanel.viewType, 'Spec', column || vscode.ViewColumn.One, {
      enableScripts: true,
    //   localResourceRoots: [vscode.Uri.file(path.join(extensionPath, 'media'))]
    })
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
    const jquery_path = require.resolve('jquery')
    const semjs_path = require.resolve('semantic-ui-css')
    const semcss_path = require.resolve('semantic-ui-css/semantic.min.css')

    const bundle_uri = vscode.Uri.file(path.join(extensionPath, 'src', 'bundle.js')).with({ scheme: 'vscode-resource' })
    const ctmcss_uri = vscode.Uri.file(path.join(extensionPath, 'src', 'custom.css')).with({ scheme: 'vscode-resource' })
    const semjs_uri = vscode.Uri.file(semjs_path).with({ scheme: 'vscode-resource' })
    const semcss_uri = vscode.Uri.file(semcss_path).with({ scheme: 'vscode-resource' })
    const jquery_uri = vscode.Uri.file(jquery_path).with({ scheme: 'vscode-resource' })
    const compiledFunction = pug.compileFile(`${__dirname}\\index.pug`)

    return compiledFunction({
      bundle_uri: bundle_uri,
      jquery_uri: jquery_uri,
      semjs_uri: semjs_uri,
      semcss_uri: semcss_uri,
      ctmcss_uri: ctmcss_uri,
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