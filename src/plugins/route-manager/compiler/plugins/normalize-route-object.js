'use strict'

const {default: template} = require('@babel/template')

module.exports = function ({types: t}) {
  return {
    name: 'normalize-route-object',
    pre() {
      this.filepath = ''
    },
    visitor: {
      Program: {
        enter(path) {
          this.filepath = path.node.directives.length && path.node.directives[0].value.value
        },
      },
      ObjectExpression: {
        exit(path) {
          const route = {}
          path.node.properties.forEach((property) => {
            route[property.key.name] = property.value
          })
          if (route.name && route.path) {
            path.node.properties.push(
              t.objectProperty(t.identifier('filepath'), t.stringLiteral(this.filepath))
            )
            path.node.properties.push(
              t.objectProperty(
                t.identifier('loc'),
                template.ast(`(${JSON.stringify(path.node.loc)})`).expression
              )
            )
          }
        },
      },
      MemberExpression: {
        exit(path) {
          const parent = path.parentPath.node
          if (
            t.isObjectProperty(parent) &&
            t.isIdentifier(parent.key) &&
            (parent.key.name === 'name' || parent.key.name === 'permission')
          ) {
            const name = path.node.object.name
            const value = path.node.property.name
            if (
              t.isIdentifier(path.node.object) &&
              (name === 'PERMISSION_PAGE' || name === 'RouteEnums')
            ) {
              path.replaceWith(
                template.ast(`({key:'${value}', value:${name}.${value}.value})`).expression
              )
            }
          }
        },
      },
    },
  }
}
