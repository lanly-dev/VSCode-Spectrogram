'use strict'
const vscode = require('vscode')
const path = require('path')
const fs = require('fs')

class Treeview {
  constructor(context) {
    const treeDataProvider = new AudioTreeDataProvider(
      vscode.workspace.rootPath
    )
    this.audiosViewer = vscode.window.createTreeView('audios', {
      treeDataProvider
    })
  }
}

class AudioTreeDataProvider {
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
      return  this.getFiles(path.join(element.filePath, element.label))
      
    } else {
      return this.getFiles(this.workspaceRoot)
    }
  }

  getFiles(thePath) {
    const toFileItem = (name, path, type) =>{
      if (type == 'directory') {
        return new fileItem(name, path, vscode.TreeItemCollapsibleState.Collapsed)
      } else {
        return new fileItem(name, path, vscode.TreeItemCollapsibleState.None)
      }
    }
    const isDirectory = name => fs.lstatSync(path.join(thePath, name)).isDirectory()
    const isMp3 = name => name.indexOf('.mp3') != -1 ? true : false

    const subdirs = fs.readdirSync(thePath).filter(isDirectory)
    const mp3s = fs.readdirSync(thePath).filter(isMp3)

    const subdirsItem = subdirs.map(name => toFileItem(name, thePath, 'directory'))
    const mp3filesItem = mp3s.map(name => toFileItem(name, thePath, 'mp3'))

    return subdirsItem.concat(mp3filesItem)

  }
}

class fileItem extends vscode.TreeItem {
  constructor(label, filePath, collapsibleState, command) {
    super(label, collapsibleState)
    this.label = label
    this.collapsibleState = collapsibleState
    this.filePath = filePath
    this.command = command
    this.contextValue = 'dependency'
  }
  get tooltip() {
    return `${this.filePath}\\${this.label}`
  }
  get description() {
    return this.label
  }
}

exports.Treeview = Treeview
exports.fileItem = fileItem
