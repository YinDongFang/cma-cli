/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-07-22 13:57:55
 * @LastEditTime: 2020-07-22 15:37:28
 * @LastEditors: Ian
 * @Description:
 */

const vscode = require('vscode')
const path = require('path')

const global = require(path.resolve(__dirname, '../global'))
const match = require('./matcher')
const EnumDecoration = require('./decorator')
const DefinitionProvider = require('./definition')

function updateDecorations(decorations) {
  let activeEditor = vscode.window.activeTextEditor
  if (!activeEditor || !activeEditor.document) return
  if (!/(routeEnums|permissionEnums)/.test(activeEditor.document.fileName)) return

  const map = /routeEnums/.test(activeEditor.document.fileName)
    ? global.routeEnumsMap
    : global.permissionMap

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
    const endPos = activeEditor.document.positionAt(match.index + match.length)

    if (!decorations[match.key]) {
      if (!map.get(match.key)) continue
      const name = map.get(match.key).fullname
      decorations[match.key] = new EnumDecoration(name, new vscode.Range(startPos, endPos))
    }
  }

  Object.keys(decorations).forEach(async (key) => {
    const decor = decorations[key]
    const decoration = await decor.createDecoration()
    activeEditor.setDecorations(decoration, decor.ranges)
  })
}

function activate(context) {
  let activeEditor = vscode.window.activeTextEditor

  vscode.languages.registerDefinitionProvider(
    {language: 'javascript', scheme: 'file', pattern: '**/{permissionEnums,routeEnums}.js'},
    new DefinitionProvider()
  )

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
