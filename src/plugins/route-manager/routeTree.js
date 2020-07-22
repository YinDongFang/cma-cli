/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-07-08 12:52:27
 * @LastEditTime: 2020-07-22 14:53:07
 * @LastEditors: Ian
 * @Description:
 */
const vscode = require('vscode')
const path = require('path')

const svgo = require('../../libs/svgo')
const applyColor = require('../../libs/svgo/plugins/applyColor')

const global = require(path.resolve(__dirname, './global'))

module.exports = class RouteTreeProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter()
    this.onDidChangeTreeData = this._onDidChangeTreeData.event
    this.reset()
  }

  reset() {
    this.routes = global.routes
    this.svgFolder = global.svgFolder
    this.extensionPath = global.context.extensionPath
  }

  getTreeItem(element) {
    return element
  }

  getChildren(element) {
    const promises = element ? this.getSubItems(element) : this.getRouteItems(this.routes)
    return Promise.all(promises)
  }

  refresh() {
    this._onDidChangeTreeData.fire()
  }

  getSubItems({route}) {
    const list = route.children.filter((item) => !item.meta || item.meta.isHeader !== false)
    return this.getRouteItems(list)
  }

  getRouteItems(routes) {
    return routes.map((route) => {
      if (route.meta.icon) {
        return svgo(path.join(this.svgFolder, `${route.meta.icon}.svg`), [
          applyColor('#e6e6e6'),
        ]).then(({data}) => new RouteItem(route, vscode.Uri.parse(data)))
      } else {
        return Promise.resolve(
          new RouteItem(route, path.join(this.extensionPath, 'src', 'media', 'route.svg'))
        )
      }
    })
  }
}

class RouteItem extends vscode.TreeItem {
  constructor(route, icon) {
    super(route.title)
    this.route = route
    this.iconPath = icon
    this.tooltip = route.filepath
    this.description = route.path[0] === '/' ? route.path : '/' + route.path
    this.contextValue = route.meta.permission ? 'subRoute' : 'rootRoute'
    this.collapsibleState =
      route.children &&
      route.children.filter((item) => !item.meta || item.meta.isHeader !== false).length
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None
  }
}
