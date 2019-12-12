'use strict'
const vscode = require('vscode')
const path = require('path')
const fs = require('fs')

class Treeview {
  static create(context) {
    const path = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : null
    const specTreeDataProvider = new SpecTreeDataProvider(path)
    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('spec', specTreeDataProvider))
    return vscode.window.createTreeView('spec-explorer', { treeDataProvider: specTreeDataProvider, showCollapseAll: true })
  }
}

class SpecTreeDataProvider {
  constructor(workspaceRoot) {
    this.workspaceRoot = workspaceRoot
    this._onDidChangeTreeData = new vscode.EventEmitter()
    this.onDidChangeTreeData = this._onDidChangeTreeData.event
  }

  refresh() {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem(element) {
    return element
  }

  getChildren(element) {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('Please open a folder')
      return Promise.resolve([])
    }

    if (element) return this.getFiles(path.join(element.filePath, element.label))
    else return this.getFiles(this.workspaceRoot)
  }

  // ??
  provideTextDocumentContent(uri, token) {
    return uri + token
  }

  getFiles(thePath) {
    const toFileItem = (name, targetPath, type) => {
      if (type == 'directory') {
        let descriptionText, collapsibleState
        const filesCount = fs.readdirSync(path.join(targetPath, name)).filter(this.isMp3).length
        if (filesCount > 0) {
          collapsibleState = vscode.TreeItemCollapsibleState.Collapsed
          descriptionText = `${filesCount} song`
          if (filesCount > 1) descriptionText += 's'
        } else {
          collapsibleState = vscode.TreeItemCollapsibleState.None
          descriptionText = 'Empty'
        }
        return new fileItem(name, targetPath, collapsibleState, descriptionText)
      } else return new fileItem(name, targetPath, vscode.TreeItemCollapsibleState.None)
    }
    const isDirectory = name => fs.lstatSync(path.join(thePath, name)).isDirectory()

    const subdirs = fs.readdirSync(thePath).filter(isDirectory)
    const mp3s = fs.readdirSync(thePath).filter(this.isMp3)

    const subdirsItem = subdirs.map(name => toFileItem(name, thePath, 'directory'))
    const mp3filesItem = mp3s.map(name => toFileItem(name, thePath, 'mp3'))

    return subdirsItem.concat(mp3filesItem)
  }

  isMp3(name) {
    return name.indexOf('.mp3') != -1 ? true : false
  }
}

class fileItem extends vscode.TreeItem {
  constructor(label, filePath, collapsibleState, descriptionText, command) {
    super(label, collapsibleState)
    this.label = label
    this.collapsibleState = collapsibleState
    this.filePath = filePath
    this.fullFilePath = path.join(this.filePath, this.label)
    this.command = command
    this.contextValue = 'dependency'
    this.descriptionText = descriptionText
  }
  get tooltip() {
    return path.join(this.filePath, this.label)
  }
  get description() {
    return this.descriptionText
  }
}

exports.Treeview = Treeview
