const {default: template} = require('@babel/template')

module.exports = function ({types: t}) {
  return {
    name: 'export-extra-object',
    pre() {
      this.entry = false
    },
    visitor: {
      Program: {
        enter(path, {opts: {entry}}) {
          const filepath = path.node.directives.length && path.node.directives[0].value.value
          this.entry = filepath === entry.replace(/\\/g, '/')
          if (!this.entry) return
          path.node.body.unshift(
            template.ast(`import { PERMISSION_PAGE } from '@/enum/types/permissionEnums';`)
          )
        },
      },
      ExportDefaultDeclaration: {
        exit(path) {
          if (!this.entry) return
          const routes = path.node.declaration
          const objectExpression = template.ast(`({ PERMISSION_PAGE,RouteEnums,routes:[] })`)
            .expression
          objectExpression.properties[2].value = routes
          path.get('declaration').replaceWith(objectExpression)
        },
      },
    },
  }
}
