const {default: template} = require('@babel/template')

module.exports = function ({types: t}) {
  return {
    name: 'enum-extra-location',
    pre() {
      this.filepath = ''
    },
    visitor: {
      Program: {
        enter(path) {
          this.filepath = path.node.directives.length && path.node.directives[0].value.value
        },
      },
      ObjectProperty: {
        exit(path) {
          if (!/(routeEnums|permissionEnums)/.test(this.filepath)) return
          if (!t.isStringLiteral(path.node.value)) return
          const {expression} = template.ast(
            `({value:'${path.node.value.value}',loc:${JSON.stringify(path.node.loc)}})`
          )
          path.get('value').replaceWith(expression)
        },
      },
    },
  }
}
