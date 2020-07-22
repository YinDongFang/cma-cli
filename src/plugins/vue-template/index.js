/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-07-06 14:03:59
 * @LastEditTime: 2020-07-22 18:55:52
 * @LastEditors: Ian
 * @Description:
 */

const vscode = require('vscode')
const path = require('path')
const fs = require('fs')

function activate(context) {
  console.log('cma-cli:vue-template is activated')

  context.subscriptions.push(
    vscode.commands.registerCommand('cmacli.vueTemplate.generate', async ({path, fsPath}) => {
      // 记载源代码
      const name = p.relative(vscode.workspace.workspaceFolders[0].uri.fsPath, fsPath)
      const data = await vscode.workspace.fs.readFile(vscode.Uri.file(path))
      // 转换代码
      let {code} = babel.transform(u2s.toUtf8(data), {
        plugins: [plugin],
        shouldPrintComment: () => false,
      })
      code = code.replace(/'/g, '"').substr(1, code.length - 3)
      // 保存文件
      await vscode.workspace.fs.writeFile(vscode.Uri.file(path), new Uint8Array(u2s.fromUtf8(code)))
      const terminal = vscode.window.createTerminal('cma-cli')
      terminal.show(false)
      terminal.sendText(`git mv ${name} ${name.replace(/\.js$/, '.json')}`)
    })
  )
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
}
