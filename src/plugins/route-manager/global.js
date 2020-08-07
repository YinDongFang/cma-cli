/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-07-22 11:14:47
 * @LastEditTime: 2020-08-07 13:49:02
 * @LastEditors: Ian
 * @Description:
 */
const compiler = require('./compiler/compiler')
const fs = require('fs')

function flat(parent) {
  return (res, item) => {
    item.path = item.path.replace(/\//, '')
    item.title = item.meta.title ? global.translate(item.meta.title) : item.path.replace('/', '')
    item.fullpath = parent ? parent.path + '/' + item.path : item.path
    item.fullname = parent ? parent.title + '-' + item.title : item.title
    return item.children ? res.concat(item.children.reduce(flat(item), [item])) : res.concat([item])
  }
}

const global = {
  context: {},
  output: {},
  root: '',
  svgFolder: '',
  routeEntryFilePath: '',
  permissionFilePath: '',
  routeEnumsFilePath: '',
  routeNamesFilePath: '',
  permissions: {},
  routeEnums: {},
  i18n: {},
  routes: [],
  // 展开的一维路由数组
  flattenRoutes: [],
  // value->key的映射
  permissionRevertMap: new Map(),
  routeEnumsRevertMap: new Map(),
  // key->route的映射
  permissionMap: new Map(),
  routeEnumsMap: new Map(),
  translate: function (keypath) {
    if (!keypath) return ''
    const chains = keypath.split('.')
    return chains.reduce((obj, key) => obj && obj[key], {route: this.i18n})
  },
  reload: async function () {
    const compilation = await compiler(
      this.root,
      this.routeEntryFilePath,
      this.context.extensionPath
    )
    const result = eval(compilation.assets['main.js'].source()).default

    const modules = compilation.modules.map((m) => m.resource)

    this.permissionFilePath = modules.find((m) => m.includes('permissionEnums'))
    this.routeEnumsFilePath = modules.find((m) => m.includes('routeEnums'))
    this.permissions = result.PERMISSION_PAGE
    this.routeEnums = result.RouteEnums
    this.i18n = JSON.parse(fs.readFileSync(this.routeNamesFilePath.replace('{lang}', 'zh-CN')))
    this.routes = result.routes

    // 保存展开数组，同时进行翻译等工作
    this.flattenRoutes = result.routes.reduce(flat(), [])

    // 保存反向映射
    this.permissionRevertMap = new Map()
    this.routeEnumsRevertMap = new Map()
    Object.entries(result.PERMISSION_PAGE).forEach(([key, {value}]) => {
      this.permissionRevertMap.set(value, key)
    })
    Object.entries(result.RouteEnums).forEach(([key, {value}]) => {
      this.routeEnumsRevertMap.set(value, key)
    })

    // 保存permission,routeEnum->route的映射
    this.permissionMap = new Map()
    this.routeEnumsMap = new Map()
    this.flattenRoutes.forEach((route) => {
      if (route.meta.permission) {
        const key = this.permissionRevertMap.get(route.meta.permission.value)
        this.permissionMap.set(key, route)
      }
      const routeKey = this.routeEnumsRevertMap.get(route.name.value)
      this.routeEnumsMap.set(routeKey, route)
    })
  },
}

module.exports = global
