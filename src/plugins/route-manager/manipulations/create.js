const vscode = require('vscode')
const path = require('path')
const fs = require('fs')
const {tify} = require('chinese-conv')

const global = require(path.resolve(__dirname, '../global'))
const {toConst, toCamel, toPascal} = require('./utils/convert')
const {modifyPermission, modifyRouteEnums} = require('./utils/modify')
const save = require('./utils/save')

const modifyRouteI18n = (keypath, value) => {
  const langs = ['zh-CN', 'en', 'zh-HK']
  const map = new Map()
  const i18ns = langs.map((lang) => {
    const filepath = global.routeNamesFilePath.replace('{lang}', lang)
    const i18n = JSON.parse(fs.readFileSync(filepath, 'utf8'))
    map.set(lang, i18n)
    return i18n
  })

  function apply(target, path, value) {
    const chains = path.split('.')
    while (chains.length > 1) {
      target = target[chains.shift()]
    }
    target[chains[0]] = value
  }

  apply(i18ns[0], keypath, value)
  apply(i18ns[1], keypath, value)
  apply(i18ns[2], keypath, tify(value))

  langs.forEach((lang) => {
    const filepath = global.routeNamesFilePath.replace('{lang}', lang)
    const text = JSON.stringify(map.get(lang), null, 2)
    fs.writeFileSync(filepath, text, 'utf8')
  })
}

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

  const existedValue = exists(keypath)
  if (!existedValue) {
    const value = await vscode.window.showInputBox({
      placeHolder: '简体中文',
      prompt: 'Please enter the title value in zh-CN',
      ignoreFocusOut: true,
    })

    if (!value) return

    return [keypath, value]
  }

  const result = await vscode.window.showInformationMessage(
    'Key already exists. Do you want to use the existing key or re-enter?',
    {modal: true},
    'Yes',
    'Re-enter'
  )
  if (result === 'Yes') return [`route.${keypath}`, existedValue]
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
  const existedCons = global.routeEnumsRevertMap.get(key)
  const existedValue = global.routeEnums[cons]
  if (!existedCons && !existedValue) {
    return [cons, key]
  }

  const result = await vscode.window.showInformationMessage(
    'Key already exists. Do you want to use the existing key or re-enter?',
    {modal: true},
    'Yes',
    'Re-enter'
  )
  if (result === 'Yes') return existedCons ? [existedCons, key] : [cons, existedValue]
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
  const existedCons = global.permissionRevertMap.get(key)
  const existedValue = global.permissions[cons]
  if (!existedCons && !existedValue) {
    return [cons, key]
  }

  const result = await vscode.window.showInformationMessage(
    'Key already exists. Do you want to use the existing key or re-enter?',
    {modal: true},
    'Yes',
    'Re-enter'
  )
  if (result === 'Yes') return existedCons ? [existedCons, key] : [cons, existedValue]
  if (result === 'Re-enter') return validatePermission(key)
}

module.exports = async function (route) {
  const keypath = await vscode.window.showInputBox({
    prompt: 'Please enter the path of the route',
    ignoreFocusOut: true,
  })
  if (!keypath) return

  const fullpath = route.fullpath.replace(/\//g, '.') + '.' + keypath
  const cons = fullpath.toUpperCase().replace(/\./g, '_')

  const title = await i18nKeypath(fullpath)
  if (!title) return

  const enumKey = await validateEnumkey(toPascal(cons))
  if (!enumKey) return

  const permission = await validatePermission(toCamel(cons))
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

  modifyRouteI18n(...title)
  modifyPermission(...permission)
  modifyRouteEnums(...enumKey)

  save(
    {
      path: keypath,
      name: enumKey[0],
      permission: `${permission[0]}PermissionList`,
      title: `route.${title[0]}`,
      isHeader: !!isHeader,
      component: view,
    },
    route,
    newFilePath
  )

  let uri
  if (newFilePath) {
    await vscode.window.showTextDocument(vscode.Uri.file(newFilePath))
    uri = vscode.window.activeTextEditor.document.uri
    await vscode.commands.executeCommand('editor.action.formatDocument', uri)
    await vscode.commands.executeCommand('eslint.executeAutofix', uri)
    await vscode.commands.executeCommand('workbench.action.files.save', uri)
  }

  await vscode.window.showTextDocument(vscode.Uri.file(route.filepath))
  uri = vscode.window.activeTextEditor.document.uri
  await vscode.commands.executeCommand('editor.action.formatDocument', uri)
  await vscode.commands.executeCommand('eslint.executeAutofix', uri)
  await vscode.commands.executeCommand('workbench.action.files.save', uri)

  return true
}
