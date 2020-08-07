/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-08-07 14:58:04
 * @LastEditTime: 2020-08-07 18:32:50
 * @LastEditors: Ian
 * @Description:
 */
const path = require('path')
const fs = require('fs')
const vscode = require('vscode')
const VuexTreeProvider = require('./vuexTree')
const match = require('./match')

const treeProvider = new VuexTreeProvider()

async function update() {
  let activeEditor = vscode.window.activeTextEditor
  if (!activeEditor || !activeEditor.document) return
  if (path.extname(activeEditor.document.fileName) !== '.vue') return

  let text = activeEditor.document.getText()

  try {
    const modules = match(text)
    treeProvider.reset(modules)
  } catch (error) {
    console.log(error)
  }
}

function activate(context, output) {
  console.log('cma-cli:vue-store is activated')

  const config = vscode.workspace.getConfiguration('cmaCli').get('storeFolder')
  output.appendLine(`config storeFolder: ${config}`)

  const workspaceFolder = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0]
  const root = config && workspaceFolder ? path.join(workspaceFolder.uri.fsPath, config) : ''

  treeProvider.setIconRootPath(path.join(context.extensionPath, 'src', 'media'))

  let activeEditor = vscode.window.activeTextEditor

  // Debouncing stuff
  let timeout
  let updateStaged = false

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('vuex', treeProvider),
    vscode.commands.registerCommand('cmacli.vueStore.file', ({contextValue, module, label}) => {
      let filepath = ''
      if (contextValue !== 'vuexModule') {
        filepath =
          module === '_'
            ? path.join(root, `${label}.js`)
            : path.join(root, 'module', module, `${label}.js`)

        console.log(filepath)

        if (fs.existsSync(filepath)) {
          vscode.window.showTextDocument(vscode.Uri.file(filepath))
          return
        }
      }

      filepath =
        module === '_' ? path.join(root, 'index.js') : path.join(root, 'module', module, 'index.js')

      console.log(filepath)
      if (!fs.existsSync(filepath) && module !== '_')
        filepath = path.join(root, 'module', `${module}.js`)

      console.log(filepath)
      if (!fs.existsSync(filepath)) return

      vscode.window.showTextDocument(vscode.Uri.file(filepath))
    })
  )

  const triggerUpdate = (force) => {
    updateStaged = true

    const runStaged = () => {
      if (updateStaged) {
        update()
        updateStaged = false
      }
    }

    if (!timeout || force) {
      runStaged()
    } else {
      clearTimeout(timeout)
    }

    timeout = setTimeout(runStaged, 500)
  }

  // Register events
  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      activeEditor = editor
      if (activeEditor) {
        triggerUpdate(true)
      }
    },
    null,
    context.subscriptions
  )

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (activeEditor && event.document === activeEditor.document) {
        triggerUpdate()
      }
    },
    null,
    context.subscriptions
  )

  vscode.workspace.onDidChangeConfiguration(() => {
    triggerUpdate()
  })

  // Trigger initial update
  if (activeEditor) {
    triggerUpdate()
  }
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
}
