/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-07-21 20:00:38
 * @LastEditTime: 2020-07-22 17:14:50
 * @LastEditors: Ian
 * @Description:
 */

const convert = {
  toConst(pascal) {
    if (!pascal) return pascal
    let cons = pascal[0].toUpperCase()
    for (let index = 1; index < pascal.length; index++) {
      const code = pascal.charCodeAt(index)
      const upper = pascal[index].toUpperCase()
      if (upper === pascal[index] && code >= 65 && code <= 90) cons += '_'
      cons += upper
    }
    return cons
  },
  toCamel(cons) {
    if (!cons) return cons
    let camel = ''
    let upper = false
    for (let index = 0; index < cons.length; index++) {
      if (cons[index] === '_') {
        upper = true
        continue
      }
      if (upper) {
        camel += cons[index].toUpperCase()
        upper = false
      } else {
        camel += cons[index].toLowerCase()
      }
    }
    return camel
  },
  toPascal(cons) {
    if (!cons) return cons
    let camel = ''
    let upper = true
    for (let index = 0; index < cons.length; index++) {
      if (cons[index] === '_') {
        upper = true
        continue
      }
      if (upper) {
        camel += cons[index].toUpperCase()
        upper = false
      } else {
        camel += cons[index].toLowerCase()
      }
    }
    return camel
  },
}
module.exports = convert