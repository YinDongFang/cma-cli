/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-07-06 16:16:11
 * @LastEditTime: 2020-07-07 01:08:08
 * @LastEditors: Ian
 * @Description:
 */

'use strict'

module.exports = function (color) {
  return {
    type: 'perItem',
    active: true,
    description: 'apply fill color',
    params: {
      color,
    },
    fn: function (item, params) {
      if (item.hasAttr('fill') && !color) {
        params.color = item.attr('fill').value
      } else if (color) {
        item.addAttr({name: 'fill', value: color, prefix: '', local: 'fill'})
      }
    },
  }
}
