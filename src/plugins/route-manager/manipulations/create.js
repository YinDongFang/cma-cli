const vscode = require('vscode')
const path = require('path')
const fs = require('fs')

const global = require(path.resolve(__dirname, '../global'))
const {toConst} = require('./utils/convert')
const {modifyPermission, modifyRouteEnums} = require('./utils/modify')
const save = require('./utils/save')

async function i18nKeypath(defaultValue) {
  function exists(keypath) {
    const chains = keypath.split('.')
    return chains.reduce((obj, key) => obj && obj[key], global.i18n)
  }

  const keypath = await vscode.window.showInputBox({
    value: defaultValue,
    prompt: 'Please enter the i18n key',
    ignoreFocusOut: true,
  })

  if (!keypath) return

  if (!exists(keypath)) {
    await vscode.commands.executeCommand('i18n-ally.new-key', `route.${keypath}`)
    console.log('save i18n key')
    global.i18n = JSON.parse(fs.readFileSync(global.routeNamesFilePath))
    console.log('i18ns after save')
    console.dir(global.i18n)
    return exists(keypath) && keypath
  }

  const result = await vscode.window.showInformationMessage(
    'Key already exists. Do you want to use the existing key or re-enter?',
    {modal: true},
    'Yes',
    'Re-enter'
  )
  if (result === 'Yes') return keypath
  if (result === 'Re-enter') return i18nKeypath(keypath)
}

async function validateEnumkey(defaultValue) {
  const key = await vscode.window.showInputBox({
    value: defaultValue,
    prompt: 'Please enter the value of the RouteEnums(Pascal)',
    ignoreFocusOut: true,
  })

  if (!key) return

  const cons = toConst(key)
  if (!global.routeEnumsRevertMap.get(key) && !global.routeEnums[cons]) {
    modifyRouteEnums(cons, key)
    return cons
  }

  const result = await vscode.window.showInformationMessage(
    'Key already exists. Do you want to use the existing key or re-enter?',
    {modal: true},
    'Yes',
    'Re-enter'
  )
  if (result === 'Yes') return key
  if (result === 'Re-enter') return validateEnumkey(key)
}

async function validatePermission(defaultValue) {
  const key = await vscode.window.showInputBox({
    value: defaultValue,
    prompt: 'Please enter the value of the permission(camel)',
    ignoreFocusOut: true,
  })

  if (!key) return

  const cons = toConst(key)
  if (!global.permissionRevertMap.get(key) && !global.permissions[cons]) {
    modifyPermission(cons, `${key}PermissionList`)
    return cons
  }

  const result = await vscode.window.showInformationMessage(
    'Key already exists. Do you want to use the existing key or re-enter?',
    {modal: true},
    'Yes',
    'Re-enter'
  )
  if (result === 'Yes') return key
  if (result === 'Re-enter') return validatePermission(key)
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

  let view = ''
  if (exists === 'yes') {
    let filepath = await vscode.window.showOpenDialog({
      canSelectMany: false,
      defaultUri: vscode.Uri.file(path.join(global.root, 'views', 'modules')),
      filters: {
        Vue: ['vue'],
      },
      title: '选择Vue组件',
    })
    if (!filepath) return
    filepath = filepath[0].path.substr(1)

    view = filepath
  } else {
    let filepath = await vscode.window.showOpenDialog({
      canSelectFolders: true,
      canSelectMany: false,
      defaultUri: vscode.Uri.file(path.join(global.root, 'views', 'modules')),
      title: '选择模板生成文件夹',
    })
    if (!filepath) return
    filepath = filepath[0].path.substr(1)

    const fullname = await vscode.commands.executeCommand('cmacli.vueTemplate.generate', filepath)
    if (!fullname) return

    view = path.join(filepath, fullname)
  }
  global.output.appendLine(`vue file is at: ${view}`)
  view = '@' + path.relative(global.root, view).replace(/\\/g, '/')
  global.output.appendLine(`the relative path is: ${view}`)

  console.dir({keypath, title, enumKey, permission, isHeader, view})

  const result = await vscode.window.showInformationMessage(
    'Whether save the route information in new file or current file?',
    {modal: true},
    'New File',
    'Current File'
  )
  if (!result) return

  let newFilePath = ''
  if (result === 'New File') {
    newFilePath = await vscode.window.showInputBox({
      value: path.dirname(route.filepath),
      prompt: 'Please enter the path',
      ignoreFocusOut: true,
    })
    if (!newFilePath) return
  }

  save(
    {
      path: keypath,
      name: enumKey,
      permission,
      title: title,
      isHeader: !!isHeader,
      component: view,
    },
    route,
    newFilePath
  )

  global.reload()
}
