const vscode = require('vscode')
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	vscode.window.showInformationMessage('Hello World!')
}
exports.activate = activate

function deactivate() {}

module.exports = {
  activate,
  deactivate
}
