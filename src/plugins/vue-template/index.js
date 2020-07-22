/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-07-06 14:03:59
 * @LastEditTime: 2020-07-22 22:15:06
 * @LastEditors: Ian
 * @Description:
 */

const vscode = require('vscode')
const path = require('path')
const fs = require('fs')

function activate(context) {
  console.log('cma-cli:vue-template is activated')

  context.subscriptions.push(
    vscode.commands.registerCommand('cmacli.vueTemplate.generate', async (context) => {
      const folder = typeof context === 'object' ? context.fsPath : context

      let fullname = ''
      let choice = ''

      do {
        const name = await vscode.window.showInputBox({
          prompt: 'Please enter the vue file name',
          ignoreFocusOut: true,
        })
        if (!name) return

        fullname = /\.vue$/.test(name) ? name : name + '.vue'
      } while (
        fs.existsSync(path.join(folder, fullname)) &&
        (choice = await vscode.window.showInformationMessage(
          `The file ${fullname} is existing. Do you want to overwrite?`,
          'Overwrite',
          'Re-enter'
        )) === 'Re-enter'
      )
      console.log(choice)
      if (!choice) return

      const templates = fs.readdirSync(path.resolve(__dirname, './templates'), 'utf8')

      const template = await vscode.window.showQuickPick(templates, {
        placeHolder: 'Please choose a vue template',
        canPickMany: false,
        ignoreFocusOut: true,
      })
      if (!template) return

      let document = fs.readFileSync(
        path.join(path.resolve(__dirname, './templates'), template),
        'utf8'
      )
      let match = null
      const params = new Set()
      const regex = /\$\{\{(\w+)\}\}/g
      while ((match = regex.exec(document))) params.add(match[1])

      const res = await new Promise(async (resolve) => {
        for (const key of params) {
          const value = await vscode.window.showInputBox({
            prompt: `Please enter the value of param: ${key}`,
            ignoreFocusOut: true,
            placeHolder: key,
          })
          if (!value) resolve()
          document = document.replace(new RegExp(`\\$\\{\\{${key}\\}\\}`, 'g'), value)
        }
        resolve(true)
      })
      if (!res) return

      fs.writeFileSync(path.join(folder, fullname), document, 'utf8')

      return true
    })
  )
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
}
