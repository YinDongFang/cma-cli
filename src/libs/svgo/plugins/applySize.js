/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-07-06 16:16:11
 * @LastEditTime: 2020-07-08 01:31:39
 * @LastEditors: Ian
 * @Description:
 */

'use strict'

module.exports = function (width, height) {
  return {
    name: 'applySize',
    custom: true,
    type: 'perItem',
    active: true,
    description: 'apply size',
    params: {
      width: 0,
      height: 0,
    },
    fn: function (item, params) {
      if (item.isElem('svg')) {
        if (item.hasAttr('width') && item.hasAttr('height') && !isNaN(Number(item.attr('width').value)) && !isNaN(Number(item.attr('height').value))) {
          params.width = Number(item.attr('width').value)
          params.height = Number(item.attr('width').height)
          if (!item.hasAttr('viewBox')) {
            item.addAttr({
              name: 'viewBox',
              value: '0 0 ' + Number(item.attr('width').value) + ' ' + Number(item.attr('height').value),
              prefix: '',
              local: 'viewBox',
            })
          }
        }
        if (width && height) {
          item.addAttr({name: 'width', value: width, prefix: '', local: 'width'})
          item.addAttr({name: 'height', value: height, prefix: '', local: 'height'})
        }
      }
    },
  }
}
