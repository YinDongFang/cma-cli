/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-07-06 14:17:11
 * @LastEditTime: 2020-07-22 14:35:40
 * @LastEditors: Ian
 * @Description:
 */
const {window, DecorationRangeBehavior} = require('vscode')

const EnumDecorator = function (name, range) {
  this.name = name
  this.ranges = [range]
}

EnumDecorator.prototype.createDecoration = async function () {
  return (this.decoration = window.createTextEditorDecorationType({
    after: {
      contentText: this.name,
      margin: '0 3px',
    },
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
  }))
}

module.exports = EnumDecorator
