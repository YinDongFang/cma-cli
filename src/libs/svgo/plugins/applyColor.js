/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-07-06 16:16:11
 * @LastEditTime: 2020-07-08 01:51:47
 * @LastEditors: Ian
 * @Description:
 */

'use strict'

module.exports = function (color) {
  return {
    name: 'applyColor',
    custom: true,
    type: 'perItem',
    active: true,
    description: 'apply fill color',
    params: {
      color: null,
    },
    fn: function (item, params) {
      if (item.hasAttr('fill') && !color) {
        params.color = item.attr('fill').value
      } else if (color) {
        item.addAttr({name: 'fill', value: color, prefix: '', local: 'fill'})
      }
    },
    after: function (svg) {
      svg.color = this.params.color
    },
  }
}
