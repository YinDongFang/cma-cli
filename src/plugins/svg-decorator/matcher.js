/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-07-06 14:40:19
 * @LastEditTime: 2020-07-07 00:23:52
 * @LastEditors: Ian
 * @Description:
 */

const REGEX = /<svg-icon[^>]*([\s\n]((icon-class|fill-color)="([^"]*)")[^>]*)+[^>]*>/g
const CHILD_REGEX = /(icon-class|fill-color)="([^"]*)"/g

module.exports = function match(text) {
  let match
  let matches = []

  while ((match = REGEX.exec(text))) {
    const element = match[0]
    let cm
    let res = {index: match.index + 9}
    while ((cm = CHILD_REGEX.exec(element))) {
      if (cm[1] === 'icon-class') {
        res.name = cm[2]
      } else if (cm[1] === 'fill-color') {
        res.color = cm[2]
      }
    }
    if (res.name || res.color) {
      matches.push(res)
    }
  }

  return matches
}
