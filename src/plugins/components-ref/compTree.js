/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-07-08 12:52:27
 * @LastEditTime: 2020-08-08 11:52:49
 * @LastEditors: Ian
 * @Description:
 */
const path = require('path')
const vscode = require('vscode')

let iconRootPath = ''

module.exports = class CompTreeProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter()
    this.onDidChangeTreeData = this._onDidChangeTreeData.event
  }

  setIconRootPath(path) {
    iconRootPath = path
  }

  reset(components) {
    this.components = components
    this._onDidChangeTreeData.fire()
  }

  getTreeItem(element) {
    return element
  }

  getChildren() {
    return this.components.map(({name, path}) => new CompItem(name, path))
  }
}

class CompItem extends vscode.TreeItem {
  constructor(title, filepath) {
    super(title)
    this.filepath = filepath
    this.description = filepath
    this.tooltip = filepath
    this.collapsibleState = vscode.TreeItemCollapsibleState.None
    this.iconPath = path.join(iconRootPath, 'vue.svg')
  }
}
