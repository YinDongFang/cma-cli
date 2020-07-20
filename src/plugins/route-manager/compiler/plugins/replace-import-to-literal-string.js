'use strict'

const {default: template} = require('@babel/template')

module.exports = function ({types: t}) {
  return {
    name: 'replace-import-to-literal-string',
    visitor: {
      ImportDeclaration: {
        exit(path) {
          const source = path.node.source.value
          const views = /^@\/?views\//
          // 替换view的import为字符串
          if (views.test(source)) {
            const value = path.node.source.value.replace(views, '/views/')
            const values = Array.apply(null, Array(path.node.specifiers.length)).map(
              () => `'${value}'`
            )
            const keys = path.node.specifiers.map((item) => item.local.name)
            path.replaceWith(template.ast(`const [${keys.join()}] = [${values.join()}]`))
          }
        },
      },
      CallExpression: {
        // 替换 import view 为字符串
        exit(path) {
          if (t.isImport(path.node.callee)) {
            path.replaceWith(
              t.stringLiteral(path.node.arguments[0].value.replace(/^@\/?views\//, '/views/'))
            )
          }
          if (
            t.isMemberExpression(path.node.callee) &&
            t.isStringLiteral(path.node.callee.object) &&
            t.isIdentifier(path.node.callee.property) &&
            path.node.callee.property.name === 'catch'
          ) {
            path.replaceWith(t.stringLiteral(path.node.callee.object.value))
          }
        },
      },
      ArrowFunctionExpression: {
        exit(path) {
          if (t.isStringLiteral(path.node.body)) {
            path.replaceWith(path.node.body)
          }
        },
      },
    },
  }
}
