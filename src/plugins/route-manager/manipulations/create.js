const vscode = require('vscode')
const path = require('path')
const fs = require('fs')

const global = require(path.resolve(__dirname, '../global'))
const {toConst} = require('./utils/convert')
const {modifyPermission, modifyRouteEnums} = require('./utils/modify')

async function i18nKeypath() {
  function exists(keypath) {
    const chains = keypath.split('.')
    return chains.reduce((obj, key) => obj && obj[key], global.i18n)
  }

  const keypath = await vscode.window.showInputBox({
    prompt: 'Please enter the i18n key',
    ignoreFocusOut: true,
  })

  if (!keypath) return

  if (!exists(keypath)) {
    await vscode.commands.executeCommand('i18n-ally.new-key', `route.${keypath}`)
    console.log('保存完毕')
    global.i18n = JSON.parse(fs.readFileSync(global.routeNamesFilePath))
    console.dir(global.i18n)
    return exists(keypath) && keypath
  }

  const result = await vscode.window.showInformationMessage(
    'Key already exists. Do you want to use the existing key or re-enter?',
    'Yes',
    'Re-enter'
  )
  if (result === 'Yes') return keypath
  if (result === 'Re-enter') return i18nKeypath(global.i18n)
}

async function validateEnumkey() {
  const key = await vscode.window.showInputBox({
    prompt: 'Please enter the value of the RouteEnums(Pascal)',
    ignoreFocusOut: true,
  })

  if (!key) return

  const cons = toConst(key)
  if (!global.routeEnumsRevertMap.get(key) && !global.routeEnums[cons]) {
    modifyRouteEnums(cons, key)
    return key
  }

  const result = await vscode.window.showInformationMessage(
    'Key already exists. Do you want to use the existing key or re-enter?',
    'Yes',
    'Re-enter'
  )
  if (result === 'Yes') return key
  if (result === 'Re-enter') return validateEnumkey()
}

async function validatePermission() {
  const key = await vscode.window.showInputBox({
    prompt: 'Please enter the value of the permission(camel)',
    ignoreFocusOut: true,
  })

  if (!key) return

  const cons = toConst(key)
  if (!global.permissionRevertMap.get(key) && !global.permissions[cons]) {
    modifyPermission(cons, key)
    return key
  }

  const result = await vscode.window.showInformationMessage(
    'Key already exists. Do you want to use the existing key or re-enter?',
    'Yes',
    'Re-enter'
  )
  if (result === 'Yes') return key
  if (result === 'Re-enter') return validatePermission()
}

module.exports = async function (route) {
  const keypath = await vscode.window.showInputBox({
    prompt: 'Please enter the path of the route',
    ignoreFocusOut: true,
  })
  if (!keypath) return

  const title = await i18nKeypath()
  if (!title) return

  const enumKey = await validateEnumkey()
  if (!enumKey) return

  const permission = await validatePermission()
  if (!permission) return

  const isHeader = await vscode.window.showQuickPick(['yes', 'no'], {
    placeHolder: 'Choose whether the route is header',
    canPickMany: false,
    ignoreFocusOut: true,
  })
  if (!isHeader) return

  const exists = await vscode.window.showQuickPick(['yes', 'no'], {
    placeHolder: 'If the vue component exists?',
    canPickMany: false,
    ignoreFocusOut: true,
  })
  if (!exists) return

  if (exists === 'yes') {
    const filepath = await vscode.window.showOpenDialog({
      canSelectMany: false,
      defaultUri: vscode.Uri.parse(path.join(global.root, 'views', 'modules')),
      filters: {
        Vue: ['vue'],
      },
      title: '选择Vue组件',
    })
  } else {
    const filepath = await vscode.window.showOpenDialog({
      canSelectFolders: true,
      canSelectMany: false,
      defaultUri: vscode.Uri.parse(path.join(global.root, 'views', 'modules')),
      title: '选择文件夹',
    })
  }

  console.dir({keypath, title, enumKey, permission, isHeader})
}
