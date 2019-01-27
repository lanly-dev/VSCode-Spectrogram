const vscode = require('vscode')
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  vscode.window.showInformationMessage('Hello World!')
  let files = vscode.workspace.findFiles('**/*.mp3', null, 100)
  files.then((data) => console.log(data),(error) => console.error(error))
}
exports.activate = activate

function deactivate() {}

module.exports = {
  activate,
  deactivate
}
