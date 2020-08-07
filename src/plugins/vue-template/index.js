/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-07-06 14:03:59
 * @LastEditTime: 2020-08-07 14:19:31
 * @LastEditors: Ian
 * @Description:
 */

const vscode = require('vscode')
const path = require('path')
const fs = require('fs')

function activate(context, output) {
  console.log('cma-cli:vue-template is activated')

  context.subscriptions.push(
    vscode.commands.registerCommand('cmacli.vueTemplate.generate', async (context) => {
      const folder = typeof context === 'object' ? context.fsPath : context
      output.appendLine(`target folder path: ${folder}`)

      const config = vscode.workspace.getConfiguration('cmaCli').get('vueTemplateFolder')

      output.appendLine(`config vueTemplateFolder: ${config}`)

      const workspaceFolder =
        vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0]
      const custom = config && workspaceFolder ? path.resolve(workspaceFolder.uri.fsPath, config) : ''

      output.appendLine(`custom vue template folder path: ${custom}`)

      let fullname = ''
      let choice = 'Not Existing'

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
          {modal: true},
          'Overwrite',
          'Re-enter'
        )) === 'Re-enter'
      )
      if (!choice) return

      const templates = fs.readdirSync(path.resolve(__dirname, './templates'), 'utf8')
      const customTemplates = custom ? fs.readdirSync(custom, 'utf8') : []

      output.appendLine(`custom vue templates: ${customTemplates.join()}`)

      const template = await vscode.window.showQuickPick(templates.concat(customTemplates), {
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

      return fullname
    })
  )
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
}
