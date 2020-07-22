/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-07-22 15:34:18
 * @LastEditTime: 2020-07-22 15:55:51
 * @LastEditors: Ian
 * @Description:
 */
const path = require('path')
const vscode = require('vscode')

const global = require(path.resolve(__dirname, '../global'))

class DefinitionProvider {
  async provideDefinition(document, position, token) {
    const regex = /([A-Z_]+)\s*:\s*['"`]\w+['"`]/

    const map = /routeEnums/.test(document.fileName) ? global.routeEnumsMap : global.permissionMap

    const range = document.getWordRangeAtPosition(position)
    const key = document.getText(range).replace(regex, '$1')

    if (!key) return []

    const route = map.get(key)

    if (!route) return []

    console.log('detected route definition')
    console.dir(route)

    const {
      filepath,
      loc: {start, end},
    } = route

    const routeDocument = await vscode.workspace.openTextDocument(filepath)
    if (!routeDocument) return []

    return new vscode.Location(
      vscode.Uri.file(filepath),
      new vscode.Range(start.line - 2, start.column, end.line - 2, end.column)
    )
  }
}

module.exports = DefinitionProvider
