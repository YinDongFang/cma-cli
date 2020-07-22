/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-07-06 14:03:59
 * @LastEditTime: 2020-07-22 14:37:58
 * @LastEditors: Ian
 * @Description:
 */

const vscode = require('vscode')
const path = require('path')
const fs = require('fs')

const editor = require('./editor')
const RouteTreeProvider = require('./routeTree')
const global = require(path.resolve(__dirname, './global'))

const root = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0]

global.root = path.join(root.uri.fsPath, vscode.workspace.getConfiguration('cmaCli').get('root'))
global.svgFolder = path.join(
  root.uri.fsPath,
  vscode.workspace.getConfiguration('cmaCli').get('svgFolder')
)
global.routeEntryFilePath = path.join(
  root.uri.fsPath,
  vscode.workspace.getConfiguration('cmaCli').get('routeEntry')
)
global.routeNamesFilePath = path.join(
  root.uri.fsPath,
  vscode.workspace.getConfiguration('cmaCli').get('routeNames')
)

const {create} = require('./manipulations')

function getLocation(obj, target) {
  const result = obj[target.key]
  return result && result.loc
}

async function activate(context, output) {
  console.log('cma-cli:route-manager is activated')

  global.context = context
  global.output = output
  await global.reload()

  editor.activate(context)

  console.log('routes parse complete')
  output.appendLine('routes parse complete')
  output.appendLine('permissionEnums filePath is: ' + global.permissionFilePath)
  output.appendLine('routeEnums filePath is: ' + global.routeEnumsFilePath)

  const routeTreeProvider = new RouteTreeProvider()

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('route', routeTreeProvider),
    vscode.commands.registerCommand('cmacli.routeManager.treeView.refresh', async () => {
      console.log('refresh routes')

      await global.reload()

      console.log('routes parse complete')
      output.appendLine('routes parse complete')

      routeTreeProvider.reset()
      routeTreeProvider.refresh()
    }),
    vscode.commands.registerCommand('cmacli.routeManager.treeView.file', ({route}) => {
      output.appendLine('open route file: ' + route.filepath)
      const loc = route.loc
      vscode.window.showTextDocument(vscode.Uri.file(route.filepath), {
        selection: new vscode.Range(
          loc.start.line - 2,
          loc.start.column,
          loc.end.line - 2,
          loc.end.column
        ),
      })
    }),
    vscode.commands.registerCommand('cmacli.routeManager.treeView.permission', ({route}) => {
      output.appendLine('open permission: ' + JSON.stringify(route.meta.permission))
      const loc = getLocation(global.permissions, route.meta.permission)
      vscode.window.showTextDocument(vscode.Uri.file(global.permissionFilePath), {
        selection: new vscode.Range(
          loc.start.line - 2,
          loc.start.column,
          loc.end.line - 2,
          loc.end.column
        ),
      })
    }),
    vscode.commands.registerCommand('cmacli.routeManager.treeView.route', ({route}) => {
      output.appendLine('open route enums: ' + JSON.stringify(route.name))
      const loc = getLocation(global.routeEnums, route.name)
      vscode.window.showTextDocument(vscode.Uri.file(global.routeEnumsFilePath), {
        selection: new vscode.Range(
          loc.start.line - 2,
          loc.start.column,
          loc.end.line - 2,
          loc.end.column
        ),
      })
    }),
    vscode.commands.registerCommand('cmacli.routeManager.treeView.vue', ({route}) => {
      let filepath = path.join(global.root, route.component)
      filepath = /\.vue$/.test(filepath)
        ? filepath
        : fs.existsSync(filepath)
        ? path.join(filepath, 'index.vue')
        : `${filepath}.vue`
      output.appendLine('open vue file: ' + filepath)
      vscode.window.showTextDocument(vscode.Uri.file(filepath))
    }),
    vscode.commands.registerCommand('cmacli.routeManager.treeView.create', (node) => {
      create(node && node.route)
    })
  )
}

function deactivate() {
  editor.deactivate()
}

module.exports = {
  activate,
  deactivate,
}
