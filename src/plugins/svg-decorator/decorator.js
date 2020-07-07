/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-07-06 14:17:11
 * @LastEditTime: 2020-07-08 01:33:58
 * @LastEditors: Ian
 * @Description:
 */
const {window, DecorationRangeBehavior, Uri} = require('vscode')
const {config} = require('./config')
const ColorLibrary = require('tinycolor2')
const svgo = require('../../libs/svgo')
const applyColor = require('../../libs/svgo/plugins/applyColor')
const applySize = require('../../libs/svgo/plugins/applySize')

function contrastColor(color) {
  let {r, g, b} = ColorLibrary(color).toRgb()
  return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '#333333' : '#EFEFEF'
}

function normaliseColor(color) {
  let {r, g, b, a} = ColorLibrary(color).toRgb()
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

const SvgDecorator = function (name, color) {
  this.color = color
  this.name = name
  this.ranges = []
}

SvgDecorator.prototype.addRange = function (range) {
  this.ranges.push(range)
}

SvgDecorator.prototype.createDecoration = async function () {
  const {
    data: svg,
    info: {color},
  } = await svgo(`${config.path}/${this.name}.svg`, [applyColor(this.color), applySize(15, 15)])

  this.color = normaliseColor((color || '#333333').toLowerCase())
  this.negativeColor = contrastColor(this.color)
  this.highlightColor = contrastColor(this.negativeColor)

  return (this.decoration = window.createTextEditorDecorationType({
    after: {
      border: `1px solid ${this.highlightColor}`,
      backgroundColor: this.negativeColor,
      width: '17px',
      height: '17px',
      margin: '1px 3px',
      contentIconPath: Uri.parse(svg),
    },
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
  }))
}

module.exports = SvgDecorator
