/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-07-06 15:12:18
 * @LastEditTime: 2020-07-08 12:42:20
 * @LastEditors: Ian
 * @Description:
 */
const vscode = require('vscode')
const p = require('path')

const config = {}

function configure() {
  const conf = vscode.workspace.getConfiguration('cmaCli')
  const path = conf.get('svgFolder')
  const root = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0]

  config.path = root ? p.join(root.uri.fsPath, path) : ''

  console.log(`svg-decorator config: ${JSON.stringify(config)}`)
}

module.exports = {
  config,
  configure,
}
