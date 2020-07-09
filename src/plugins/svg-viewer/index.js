/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-07-06 14:03:59
 * @LastEditTime: 2020-07-08 17:44:45
 * @LastEditors: Ian
 * @Description:
 */

const vscode = require('vscode')
const path = require('path')
const fs = require('fs')
const clipboardy = require('clipboardy')

const svgo = require('../../libs/svgo')
const applyColor = require('../../libs/svgo/plugins/applyColor')
const applySize = require('../../libs/svgo/plugins/applySize')
const SvgTreeProvider = require('./svgTree.js')

const root = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0]
const dir = path.join(root.uri.fsPath, vscode.workspace.getConfiguration('cmaCli').get('svgFolder'))

let panel
let list = []

function getWebViewContent(context, folder) {
  const resourcePath = path.join(context.extensionPath, folder)
  const index = path.join(context.extensionPath, folder, 'index.html')

  let html = fs.readFileSync(index, 'utf-8')
  html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => {
    return $1 + vscode.Uri.file(path.join(resourcePath, $2)).with({scheme: 'vscode-resource'}).toString() + '"'
  })
  return html
}

async function optimize(svg) {
  const optimized = await svgo(svg.path, [{removeAttrs: {attrs: '(stroke|fill)'}}], false)
  fs.writeFileSync(svg.path, optimized.data)
  panel.webview.postMessage({
    command: 'optimized',
    data: true,
  })

  const source = list.find((item) => item.path === svg.path)
  source.data = optimized.data
  source.color = null
  panel.webview.postMessage({
    command: 'update',
    data: list,
  })
}

function load() {
  // load svgs
  const promises = fs
    .readdirSync(dir, 'utf8')
    .filter((file) => path.extname(file) === '.svg')
    .map((file) => svgo(path.join(dir, file), [applyColor(), applySize()], false))
  return Promise.all(promises).then((result) => {
    list = result.map((res) => {
      return {
        ...res,
        ...res.info,
        name: path.basename(res.path, '.svg'),
      }
    })
    panel.webview.postMessage({
      command: 'update',
      data: list,
    })
  })
}

function show(name) {
  panel.webview.postMessage({
    command: 'show',
    data: name,
  })
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('cmacli.svgViewer.preview', (name) => {
      const folder = path.join('src', 'plugins', 'svg-viewer', 'dist')

      if (panel) {
        panel.reveal()
        if (name) show(name)
      } else {
        // create webview
        panel = vscode.window.createWebviewPanel(
          'CmaCli.SvgViewer', // Identifies the type of the webview. Used internally
          'Svg Preview', // Title of the panel displayed to the user
          vscode.ViewColumn.Active, // Editor column to show the new webview panel in.
          {
            localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, folder))],
            enableScripts: true,
            retainContextWhenHidden: true,
          }
        )
        panel.webview.html = getWebViewContent(context, folder)
        panel.webview.onDidReceiveMessage(
          async ({command, data}) => {
            if (command === 'created') {
              await load()
              if (name) show(name)
            } else if (command === 'optimize') {
              optimize(data)
            }
          },
          undefined,
          context.subscriptions
        )
        panel.onDidDispose(
          () => {
            panel = undefined
          },
          null,
          context.subscriptions
        )
      }
    })
  )

  const svgTreeProvider = new SvgTreeProvider(dir)
  vscode.window.registerTreeDataProvider('svg', svgTreeProvider)
  vscode.commands.registerCommand('cmacli.svgViewer.treeView.refresh', () => {
    svgTreeProvider.refresh()
  })
  vscode.commands.registerCommand('cmacli.svgViewer.treeView.viewAll', () => {
    vscode.commands.executeCommand('cmacli.svgViewer.preview')
  })
  vscode.commands.registerCommand('cmacli.svgViewer.treeView.view', (svgItem) => {
    vscode.commands.executeCommand('cmacli.svgViewer.preview', svgItem.label)
  })
  vscode.commands.registerCommand('cmacli.svgViewer.treeView.copy', (svgItem) => {
    clipboardy.writeSync(svgItem.label)
    vscode.window.showInformationMessage('复制成功');
  })
  vscode.commands.registerCommand('cmacli.svgViewer.treeView.code', (svgItem) => {
    clipboardy.writeSync(`<svg-icon icon-class="${svgItem.label}" />`)
    vscode.window.showInformationMessage('复制成功');
  })
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
}
