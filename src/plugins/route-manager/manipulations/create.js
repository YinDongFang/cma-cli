const vscode = require('vscode')

async function i18nKeypath(i18n) {
  function exists(keypath) {
    const chains = keypath.split('.')
    return chains.reduce((obj, key) => obj && obj[key], {route: i18n})
  }

  const keypath = await vscode.window.showInputBox({
    prompt: 'Please enter the i18n key',
    ignoreFocusOut: true,
  })

  if (!keypath) return

  if (!exists(keypath)) {
    await vscode.commands.executeCommand('i18n-ally.new-key', `route.${keypath}`)
    return exists(keypath) && keypath
  }

  const result = await vscode.window.showInformationMessage(
    'Key already exists. Do you want to use the existing key or re-enter?',
    {modal: true},
    'yes',
    're-enter',
    'cancel'
  )
  if (result === 'yes') return keypath
  if (result === 're-enter') return i18nKeypath(i18n)
}

async function validateEnumkey(enums) {
  function exists(key) {
    return enums.find((line) => new RegExp(`['"]${key}['"]`).test(line))
  }

  const key = await vscode.window.showInputBox({
    prompt: 'Please enter the value of the RouteEnums',
    ignoreFocusOut: true,
  })

  if (!key) return

  if (!exists(key)) {
    // 生成
    return key
  }

  const result = await vscode.window.showInformationMessage(
    'Key already exists. Do you want to use the existing key or re-enter?',
    {modal: true},
    'yes',
    're-enter',
    'cancel'
  )
  if (result === 'yes') return key
  if (result === 're-enter') return validateEnumkey(enums)
}

async function validatePermission(permissions) {
  function exists(key) {
    return permissions.find((line) => new RegExp(`['"]${key}['"]`).test(line))
  }

  const key = await vscode.window.showInputBox({
    prompt: 'Please enter the value of the permission',
    ignoreFocusOut: true,
  })

  if (!key) return

  if (!exists(key)) {
    // 生成
    return key
  }

  const result = await vscode.window.showInformationMessage(
    'Key already exists. Do you want to use the existing key or re-enter?',
    {modal: true},
    'yes',
    're-enter',
    'cancel'
  )
  if (result === 'yes') return key
  if (result === 're-enter') return validatePermission(permissions)
}

module.exports = async function (ctx, parent) {
  const keypath = await vscode.window.showInputBox({
    prompt: 'Please enter the path of the route',
    ignoreFocusOut: true,
  })
  if (!keypath) return

  const title = await i18nKeypath(ctx.i18n)
  if (!title) return

  const enumKey = validateEnumkey(ctx.routeEnums)
  if (!enumKey) return

  const permission = validatePermission(ctx.permissions)
  if (!permission) return
}
