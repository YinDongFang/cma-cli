/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-08-07 14:58:04
 * @LastEditTime: 2020-08-08 11:53:44
 * @LastEditors: Ian
 * @Description:
 */
const path = require('path')
const fs = require('fs')
const vscode = require('vscode')
const CompTreeProvider = require('./compTree')
const match = require('./match')

let src = ''
const treeProvider = new CompTreeProvider()

async function update() {
  let activeEditor = vscode.window.activeTextEditor
  if (!activeEditor || !activeEditor.document) return
  if (path.extname(activeEditor.document.fileName) !== '.vue') return

  let text = activeEditor.document.getText()

  try {
    const components = match(text)

    components.forEach((comp) => {
      comp.path = comp.path.replace('@/', `${src}/`).replace('@', `${src}/`)
      comp.path = path.resolve(path.dirname(activeEditor.document.uri.fsPath), comp.path)
    })

    treeProvider.reset(components)
  } catch (error) {
    console.log(error)
  }
}

function activate(context) {
  console.log('cma-cli:components-ref is activated')

  const root = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0]
  src = path.join(root.uri.fsPath, vscode.workspace.getConfiguration('cmaCli').get('root'))

  treeProvider.setIconRootPath(path.join(context.extensionPath, 'src', 'media'))

  let activeEditor = vscode.window.activeTextEditor

  // Debouncing stuff
  let timeout
  let updateStaged = false

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('components', treeProvider),
    vscode.commands.registerCommand('cmacli.componentsRef.file', ({filepath}) => {
      let realPath = filepath

      if (!fs.existsSync(realPath)) realPath = `${filepath}.vue`

      if (!fs.existsSync(realPath)) realPath = path.join(filepath, 'index.vue')

      if (!fs.existsSync(realPath)) realPath = path.join(filepath, 'src', 'index.vue')

      if (!fs.existsSync(realPath)) realPath = path.join(filepath, 'index.js')

      if (!fs.existsSync(realPath)) return

      vscode.window.showTextDocument(vscode.Uri.file(realPath))
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
