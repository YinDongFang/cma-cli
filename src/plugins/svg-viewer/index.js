/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-07-06 14:03:59
 * @LastEditTime: 2020-07-08 02:03:47
 * @LastEditors: Ian
 * @Description:
 */

const vscode = require('vscode')
const path = require('path')
const fs = require('fs')
const svgo = require('../../libs/svgo')
const applyColor = require('../../libs/svgo/plugins/applyColor')
const applySize = require('../../libs/svgo/plugins/applySize')

function getWebViewContent(context, folder) {
  const resourcePath = path.join(context.extensionPath, folder)
  const index = path.join(context.extensionPath, folder, 'index.html')

  let html = fs.readFileSync(index, 'utf-8')
  html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => {
    return $1 + vscode.Uri.file(path.join(resourcePath, $2)).with({scheme: 'vscode-resource'}).toString() + '"'
  })
  return html
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('svgViwer.all', () => {
      const folder = path.join('src', 'plugins', 'svg-viewer', 'dist')
      let list = []

      // create webview
      const panel = vscode.window.createWebviewPanel(
        'CmaCli.SvgViewer', // Identifies the type of the webview. Used internally
        'Svg Preview', // Title of the panel displayed to the user
        vscode.ViewColumn.One, // Editor column to show the new webview panel in.
        {
          localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, folder))],
          enableScripts: true,
          retainContextWhenHidden: true,
        }
      )
      panel.webview.html = getWebViewContent(context, folder)
      panel.webview.onDidReceiveMessage(
        async ({command, svg}) => {
          if (command === 'optimize' && svg) {
            const optimized = await svgo(svg.path, [{removeAttrs: {attrs: '(stroke|fill)'}}], false)
            fs.writeFileSync(svg.path, optimized.data)
            panel.webview.postMessage({
              command: 'optimized',
              result: true,
            })

            const source = list.find(item => item.path === svg.path)
            source.data = optimized.data
            source.color = null
            panel.webview.postMessage({
              command: 'update',
              list,
            })
          }
        },
        undefined,
        context.subscriptions
      )

      // load svgs
      const conf = vscode.workspace.getConfiguration('cmaCli')
      const root = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0]
      const dir = path.join(root.uri.fsPath, conf.get('svgViewer.path'))
      const promises = fs
        .readdirSync(dir, 'utf8')
        .filter((file) => path.extname(file) === '.svg')
        .map((file) => svgo(path.join(dir, file), [applyColor(), applySize()], false))
      Promise.all(promises).then((result) => {
        list = result.map((res) => {
          return {
            ...res,
            ...res.info,
            name: path.basename(res.path, '.svg'),
          }
        })
        panel.webview.postMessage({
          command: 'update',
          list,
        })
      })
    })
  )
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
}
