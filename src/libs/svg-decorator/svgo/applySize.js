/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-07-06 16:16:11
 * @LastEditTime: 2020-07-07 00:44:04
 * @LastEditors: Ian
 * @Description:
 */

'use strict'

module.exports = function (width, height) {
  return {
    type: 'perItem',
    active: true,
    description: 'apply size',
    params: {
      width,
      height,
    },
    fn: function (item, params) {
      if (item.isElem('svg')) {
        if (!item.hasAttr('viewBox') && item.hasAttr('width') && item.hasAttr('height') && !isNaN(Number(item.attr('width').value)) && !isNaN(Number(item.attr('height').value))) {
          item.addAttr({
            name: 'viewBox',
            value: '0 0 ' + Number(item.attr('width').value) + ' ' + Number(item.attr('height').value),
            prefix: '',
            local: 'viewBox',
          })
        }
        item.addAttr({name: 'width', value: params.width, prefix: '', local: 'width'})
        item.addAttr({name: 'height', value: params.height, prefix: '', local: 'height'})
      }
    },
  }
}
