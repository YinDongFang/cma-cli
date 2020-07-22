const fs = require('fs')
const path = require('path')
const babel = require('@babel/core')

const global = require(path.resolve(__dirname, '../../global'))

let key = ''
let value = ''

const plugin = ({types: t}) => {
  return {
    visitor: {
      VariableDeclarator: {
        exit({node}) {
          if (
            t.isIdentifier(node.id) &&
            (node.id.name === 'PERMISSION_PAGE' || node.id.name === 'RouteEnums')
          ) {
            node.init.properties.push(t.objectProperty(t.identifier(key), t.stringLiteral(value)))
          }
        },
      },
    },
  }
}

module.exports = {
  modifyPermission(_key, _value) {
    key = _key
    value = _value
    const {code} = babel.transformFileSync(global.permissionFilePath, {
      comments: false,
      plugins: [plugin],
    })
    fs.writeFileSync(global.permissionFilePath, code, 'utf8')
  },
  modifyRouteEnums(_key, _value) {
    key = _key
    value = _value
    const {code} = babel.transformFileSync(global.routeEnumsFilePath, {
      comments: false,
      plugins: [plugin],
    })
    fs.writeFileSync(global.routeEnumsFilePath, code, 'utf8')
  },
}
