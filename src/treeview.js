'use strict'
const vscode = require('vscode')
const path = require('path')
const fs = require('fs')

class Treeview {
  constructor(context) {
    const treeDataProvider = new SpecTreeDataProvider(vscode.workspace.rootPath)
    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('spec', treeDataProvider))
    this.specViewer = vscode.window.createTreeView('spec', { treeDataProvider })
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

    if (element) {
      return this.getFiles(path.join(element.filePath, element.label))
    } else {
      return this.getFiles(this.workspaceRoot)
    }
  }

  getFiles(thePath) {
    const toFileItem = (name, path, type) => {
      if (type == 'directory') {
        let descriptionText, collapsibleState
        const filesCount = fs.readdirSync(`${path}\\${name}`).filter(this.isMp3).length
        if (filesCount > 0) {
          collapsibleState = vscode.TreeItemCollapsibleState.Collapsed
          descriptionText = `${filesCount} song`
          if (filesCount > 1) descriptionText += 's'
        } else {
          collapsibleState = vscode.TreeItemCollapsibleState.None
          descriptionText = 'Empty'
        }
        return new fileItem(name, path, collapsibleState, descriptionText)
      } else {
        return new fileItem(name, path, vscode.TreeItemCollapsibleState.None)
      }
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
    this.command = command
    this.contextValue = 'dependency'
    this.descriptionText = descriptionText
  }
  get tooltip() {
    return `${this.filePath}\\${this.label}`
  }
  get description() {
    return this.descriptionText
  }
}

exports.Treeview = Treeview
exports.fileItem = fileItem
