/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-07-06 14:03:59
 * @LastEditTime: 2020-07-21 22:29:25
 * @LastEditors: Ian
 * @Description:
 */

const vscode = require('vscode')
const path = require('path')
const fs = require('fs')
const readObject = require('./readObject')

const RouteTreeProvider = require('./routeTree')
const compiler = require('./compiler/compiler')

const ctx = {}
const {create} = require('./manipulations')({ctx})

const root = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0]

const rootDir = path.join(root.uri.fsPath, vscode.workspace.getConfiguration('cmaCli').get('root'))
const svgFolder = path.join(
  root.uri.fsPath,
  vscode.workspace.getConfiguration('cmaCli').get('svgFolder')
)
const routeEntry = path.join(
  root.uri.fsPath,
  vscode.workspace.getConfiguration('cmaCli').get('routeEntry')
)
const routeNames = path.join(
  root.uri.fsPath,
  vscode.workspace.getConfiguration('cmaCli').get('routeNames')
)

const names = require(routeNames)
let permissionFilePath
let routeEnumsFilePath
let permissions
let routeEnums

async function parse(context) {
  const stats = await compiler(rootDir, routeEntry, context.extensionPath)

  const modules = stats.compilation.modules.map((m) => m.resource)
  permissionFilePath = modules.find((m) => m.includes('permissionEnums'))
  routeEnumsFilePath = modules.find((m) => m.includes('routeEnums'))

  permissions = readObject(permissionFilePath)
  routeEnums = readObject(routeEnumsFilePath)

  ctx.permissionFilePath = permissionFilePath
  ctx.routeEnumsFilePath = routeEnumsFilePath
  ctx.permissions = permissions
  ctx.routeEnums = routeEnums
  ctx.i18n = names

  return eval(stats.compilation.assets['main.js'].source()).default
}

function getLocation(obj, key) {
  const values = Object.values(obj)
  const target = values.find((item) => item.value === key)
  return target && target.loc
}

async function activate(context, output) {
  console.log('cma-cli:route-manager is activated')

  const routes = await parse(context)
  console.log('routes parse complete')
  output.appendLine('routes parse complete')

  output.appendLine('permissionEnums filePath is: ' + permissionFilePath)
  output.appendLine('routeEnums filePath is: ' + routeEnumsFilePath)

  const routeTreeProvider = new RouteTreeProvider(routes, names, svgFolder, context.extensionPath)

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('route', routeTreeProvider),
    vscode.commands.registerCommand('cmacli.routeManager.treeView.refresh', () => {
      routeTreeProvider.refresh()
    }),
    vscode.commands.registerCommand('cmacli.routeManager.treeView.file', ({route}) => {
      output.appendLine('open route file: ' + route.filepath)
      vscode.window.showTextDocument(vscode.Uri.file(route.filepath))
    }),
    vscode.commands.registerCommand('cmacli.routeManager.treeView.permission', ({route}) => {
      output.appendLine('open permission: ' + route.meta.permission)
      const loc = getLocation(permissions, route.meta.permission)
      vscode.window.showTextDocument(vscode.Uri.file(permissionFilePath), {
        selection: new vscode.Range(
          loc.start.line - 1,
          loc.start.column,
          loc.end.line - 1,
          loc.end.column
        ),
      })
    }),
    vscode.commands.registerCommand('cmacli.routeManager.treeView.route', ({route}) => {
      output.appendLine('open route enums: ' + route.name)
      const loc = getLocation(routeEnums, route.name)
      vscode.window.showTextDocument(vscode.Uri.file(routeEnumsFilePath), {
        selection: new vscode.Range(
          loc.start.line - 1,
          loc.start.column,
          loc.end.line - 1,
          loc.end.column
        ),
      })
    }),
    vscode.commands.registerCommand('cmacli.routeManager.treeView.vue', ({route}) => {
      let filepath = path.join(rootDir, route.component)
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

function deactivate() {}

module.exports = {
  activate,
  deactivate,
}
