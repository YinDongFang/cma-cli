/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-07-06 14:03:59
 * @LastEditTime: 2020-07-21 00:13:44
 * @LastEditors: Ian
 * @Description:
 */

const vscode = require('vscode')
const path = require('path')
const fs = require('fs')
const readline = require('readline')

const RouteTreeProvider = require('./routeTree')
const compiler = require('./compiler/compiler')

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

function readLines(path) {
  return new Promise((resolve) => {
    const lines = []

    const readInterface = readline.createInterface({
      input: fs.createReadStream(path, 'utf-8'),
    })
    readInterface.on('line', function (line) {
      lines.push(line)
    })
    readInterface.on('close', function () {
      resolve(lines)
    })
  })
}

async function parse(context) {
  const stats = await compiler(rootDir, routeEntry, context)

  const modules = stats.compilation.modules.map((m) => m.resource)
  permissionFilePath = modules.find((m) => m.includes('permissionEnums'))
  routeEnumsFilePath = modules.find((m) => m.includes('routeEnums'))

  return eval(stats.compilation.assets['main.js'].source()).default
}

async function activate(context) {
  console.log('cma-cli:route-manager is activated')

  const routes = await parse(context.extensionPath)

  const permissions = await readLines(permissionFilePath)
  const routeEnums = await readLines(routeEnumsFilePath)

  const routeTreeProvider = new RouteTreeProvider(routes, names, svgFolder, context.extensionPath)

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('route', routeTreeProvider),
    vscode.commands.registerCommand('cmacli.routeManager.treeView.refresh', () => {
      routeTreeProvider.refresh()
    }),
    vscode.commands.registerCommand('cmacli.routeManager.treeView.file', ({route}) => {
      vscode.window.showTextDocument(vscode.Uri.file(route.filepath))
    }),
    vscode.commands.registerCommand('cmacli.routeManager.treeView.permission', ({route}) => {
      console.log(route)
      const line = permissions.findIndex((line) => line.includes(route.meta.permission))
      vscode.window.showTextDocument(vscode.Uri.file(permissionFilePath), {
        selection: new vscode.Range(line, 0, line, Number.MAX_VALUE),
      })
    }),
    vscode.commands.registerCommand('cmacli.routeManager.treeView.route', ({route}) => {
      const line = routeEnums.findIndex((line) => line.includes(route.name))
      vscode.window.showTextDocument(vscode.Uri.file(routeEnumsFilePath), {
        selection: new vscode.Range(line, 0, line, Number.MAX_VALUE),
      })
    }),
    vscode.commands.registerCommand('cmacli.routeManager.treeView.vue', ({route}) => {
      const file = route.component.includes('.vue') ? route.component : `${route.component}.vue`
      vscode.window.showTextDocument(vscode.Uri.file(path.join(rootDir, file)))
    })
  )
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
}
