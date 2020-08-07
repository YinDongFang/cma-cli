/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-07-08 12:52:27
 * @LastEditTime: 2020-08-07 18:05:55
 * @LastEditors: Ian
 * @Description:
 */
const path = require('path')
const vscode = require('vscode')

let iconRootPath = ''

module.exports = class VuexTreeProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter()
    this.onDidChangeTreeData = this._onDidChangeTreeData.event
  }

  setIconRootPath(path) {
    iconRootPath = path
  }

  reset(modules) {
    this.modules = modules
    this._onDidChangeTreeData.fire()
  }

  getTreeItem(element) {
    return element
  }

  getChildren(element) {
    if (!this.modules) return
    const promises = element ? this.getSubItems(element) : this.getRootItems(this.modules)
    return Promise.all(promises)
  }

  getSubItems({data}) {
    return Array.isArray(data) ? this.getItems(data, data.name) : this.getModule(data)
  }

  getItems(items, m) {
    return items.map((item) => new VuexItem(item, '', m))
  }

  getModule(module) {
    return [
      new VuexItem('actions', module.actions, module.name),
      new VuexItem('states', module.states, module.name),
      new VuexItem('mutations', module.mutations, module.name),
      new VuexItem('getters', module.getters, module.name),
    ]
  }

  getRootItems(modules) {
    return modules.map((m) => new VuexItem(m.name, m, m.name))
  }
}

class VuexItem extends vscode.TreeItem {
  constructor(title, data, module) {
    super(title)
    this.data = data
    this.module = module
    this.description = (Array.isArray(data) && data.length) ? `${data.length}` : ''
    this.contextValue = Array.isArray(data) ? 'vuexProp' : typeof data === 'object' ? 'vuexModule' : 'vuexItem'
    this.collapsibleState =
      (Array.isArray(data) && data.length) || typeof data === 'object'
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None
    this.iconPath = Array.isArray(data)
      ? title === 'actions'
        ? path.join(iconRootPath, 'action.svg')
        : path.join(iconRootPath, 'list.svg')
      : typeof data === 'object'
      ? path.join(iconRootPath, 'module.svg')
      : ''
  }
}
