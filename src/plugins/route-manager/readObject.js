const {default: template} = require('@babel/template')
const babel = require('@babel/core')

const plugin = ({types: t}) => {
  return {
    name: 'read-object',
    visitor: {
      ObjectProperty: {
        exit(path) {
          if (!t.isStringLiteral(path.node.value)) return
          const {expression} = template.ast(
            `({value:'${path.node.value.value}',loc:${JSON.stringify(path.node.loc)}})`
          )
          path.get('value').replaceWith(expression)
        },
      },
      ExportNamedDeclaration: {
        exit(path) {
          path.replaceWith(template.ast(`module.exports = PERMISSION_PAGE`))
        },
      },
      ExportDefaultDeclaration: {
        exit(path) {
          path.replaceWith(template.ast(`module.exports = RouteEnums`))
        },
      },
    },
  }
}

const read = (filepath) => {
  const {code} = babel.transformFileSync(filepath, {
    plugins: [plugin],
  })
  return eval(code)
}

module.exports = read