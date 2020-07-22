/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-07-06 14:40:19
 * @LastEditTime: 2020-07-22 14:06:02
 * @LastEditors: Ian
 * @Description:
 */

const REGEX = /([A-Z_]+)\s*:\s*['"`]\w+['"`]/g

module.exports = function match(text) {
  let match
  let matches = []
  while ((match = REGEX.exec(text)))
    matches.push({index: match.index, length: match[0].length, key: match[1]})
  return matches
}
