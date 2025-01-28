'use strict'
const vscode = require('vscode')
const path = require('path')
const fs = require('fs')
const { loadMusicMetadata } = require('music-metadata') // Import loadMusicMetadata

class TreeView {
  static create() {
    const path = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : null
    const specTreeDataProvider = new SpecTreeDataProvider(path)

    return vscode.window.createTreeView('spectrogram-explorer', {
      treeDataProvider: specTreeDataProvider,
      showCollapseAll: true
    })
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

  async getFiles(thePath) {
    // name
    const toFileItem = async (name, targetPath, type) => {
      if (type === 'directory') {
        let descriptionText, collapsibleState
        const filesCount = fs.readdirSync(path.join(targetPath, name)).filter(this.isSupportedMedia).length
        if (filesCount > 0) {
          collapsibleState = vscode.TreeItemCollapsibleState.Collapsed
          descriptionText = `${filesCount} song`
          if (filesCount > 1) descriptionText += 's'
        } else {
          collapsibleState = vscode.TreeItemCollapsibleState.None
          descriptionText = 'Empty'
        }
        return new fileItem(name, targetPath, collapsibleState, descriptionText)
      } else {
        const duration = await this.getAudioDuration(path.join(targetPath, name))
        return new fileItem(name, targetPath, vscode.TreeItemCollapsibleState.None, duration)
      }
    }
    const isDirectory = name => fs.lstatSync(path.join(thePath, name)).isDirectory()

    const subDirs = fs.readdirSync(thePath).filter(isDirectory)
    const mp3s = fs.readdirSync(thePath).filter(this.isSupportedMedia)

    const subDirsItem = await Promise.all(subDirs.map(name => toFileItem(name, thePath, 'directory')))
    const mp3filesItem = await Promise.all(mp3s.map(name => toFileItem(name, thePath, 'audio')))

    return subDirsItem.concat(mp3filesItem)
  }

  async getAudioDuration(filePath) {
    const mm = await loadMusicMetadata() // Dynamically load the ESM module
    return mm.parseFile(filePath).then(metadata => {
      const duration = metadata.format.duration
      return this.formatDuration(duration)
    }).catch(err => {
      console.error(`Error parsing file ${filePath}:`, err)
      return 'Unknown duration'
    })
  }

  formatDuration(duration) {
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  isSupportedMedia(name) {
    if (name.indexOf('.mp3') !== -1) return true
    if (name.indexOf('.flac') !== -1) return true
  }
}

class fileItem extends vscode.TreeItem {
  constructor(label, filePath, collapsibleState, descriptionText) {
    super(label, collapsibleState)
    this.collapsibleState = collapsibleState
    this.contextValue = 'dependency'
    this.description = descriptionText
    this.filePath = filePath

    this.label = label
    this.fullFilePath = path.join(this.filePath, this.label)
    this.tooltip = path.join(this.filePath, this.label)
  }
}

exports.TreeView = TreeView
