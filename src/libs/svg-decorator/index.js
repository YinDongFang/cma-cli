/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-07-06 14:03:59
 * @LastEditTime: 2020-07-07 01:02:10
 * @LastEditors: Ian
 * @Description:
 */

const vscode = require('vscode')
const match = require('./matcher')
const SvgDecoration = require('./decorator')
const {configure} = require('./config')

function updateDecorations(decorations) {
  let activeEditor = vscode.window.activeTextEditor
  if (!activeEditor || !activeEditor.document) return

  if (decorations) {
    Object.keys(decorations).forEach((key) => {
      let decor = decorations[key]
      decor.decoration.dispose()
      delete decorations[key]
    })
  }

  let text = activeEditor.document.getText()
  let matches = match(text)
  for (let match of matches) {
    const startPos = activeEditor.document.positionAt(match.index)
    const endPos = activeEditor.document.positionAt(match.index)

    if (!decorations[match.name + match.color]) {
      decorations[match.name + match.color] = new SvgDecoration(match.name, match.color)
    }

    decorations[match.name + match.color].addRange(new vscode.Range(startPos, endPos))
  }

  Object.keys(decorations).forEach(async (key) => {
    const decor = decorations[key]
    const decoration = await decor.createDecoration()
    activeEditor.setDecorations(decoration, decor.ranges)
  })
}

function activate(context) {
  console.log('cma-cli:svg-decorator is activated')

  configure()

  let activeEditor = vscode.window.activeTextEditor

  // Global State
  let decorations = {}

  // Debouncing stuff
  let timeout
  let updateStaged = false

  const triggerUpdateDecorations = (force) => {
    updateStaged = true

    const runStaged = () => {
      if (updateStaged) {
        updateDecorations(decorations)
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
        triggerUpdateDecorations(true)
      }
    },
    null,
    context.subscriptions
  )

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (activeEditor && event.document === activeEditor.document) {
        triggerUpdateDecorations()
      }
    },
    null,
    context.subscriptions
  )

  vscode.workspace.onDidChangeConfiguration(() => {
    configure()
  })

  // Trigger initial update
  if (activeEditor) {
    triggerUpdateDecorations()
  }
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
}
