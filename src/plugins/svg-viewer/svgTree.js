/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-07-08 12:52:27
 * @LastEditTime: 2020-07-08 14:03:14
 * @LastEditors: Ian
 * @Description:
 */
const vscode = require('vscode')
const path = require('path')
const fs = require('fs')

const svgo = require('../../libs/svgo')

module.exports = class SvgTreeProvider {
  constructor(svgFolder) {
    this._onDidChangeTreeData = new vscode.EventEmitter()
    this.onDidChangeTreeData = this._onDidChangeTreeData.event
    this.svgFolder = svgFolder
  }

  getTreeItem(element) {
    return element
  }

  getChildren() {
    return this.getSvgItems(this.svgFolder)
  }

  refresh() {
    this._onDidChangeTreeData.fire()
  }

  getSvgItems(svgFolder) {
    const promises = fs
      .readdirSync(svgFolder, 'utf8')
      .filter((file) => path.extname(file) === '.svg')
      .map((file) => svgo(path.join(svgFolder, file), []))
    return Promise.all(promises).then((list) => {
      return list.map(({data, path: url}) => new SvgItem(vscode.Uri.parse(data), path.basename(url, '.svg')))
    })
  }
}

class SvgItem extends vscode.TreeItem {
  constructor(iconUri, label) {
    super(label, vscode.TreeItemCollapsibleState.None)
    this.iconPath = iconUri
  }

  get tooltip() {
    return this.label
  }

  get description() {
    return ''
  }
}
