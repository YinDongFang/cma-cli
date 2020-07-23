const fs = require('fs')
const path = require('path')
const babel = require('@babel/core')
const {default: template} = require('@babel/template')

const global = require(path.resolve(__dirname, '../../global'))
const {toPascal} = require('./convert')

const saveSubRoutePlugin = ({types: t}) => {
  return {
    visitor: {
      Program: {
        exit({node}, {opts: {newFilePath, key}}) {
          if (newFilePath) {
            node.body.splice(
              node.body.length - 1,
              0,
              template.ast(`import ${key} from '${newFilePath}'`)
            )
          }
        },
      },
      ObjectExpression: {
        exit({node}, {opts: {ast, newFilePath, key, parentPath}}) {
          const path = node.properties.find(
            (prop) =>
              t.isIdentifier(prop.key) && prop.key.name === 'path' && t.isStringLiteral(prop.value)
          )

          if (path && path.value.value.replace(/\//g, '') === parentPath) {
            let children = node.properties.find((prop) => {
              t.isIdentifier(prop.key) &&
                prop.key.name === 'children' &&
                t.isArrayExpression(prop.value)
            })

            if (!children)
              node.properties.push(
                (children = t.objectProperty(t.identifier('children'), t.arrayExpression()))
              )

            if (newFilePath) {
              children.value.elements.push(t.identifier(key))
            } else {
              children.value.elements.push(ast)
            }
          }
        },
      },
    },
  }
}

const newFilePlugin = ({types: t}) => {
  return {
    visitor: {
      Program: {
        exit({node}, {opts: {ast}}) {
          node.body.push(
            ...template.ast(`import RouteEnums from '@/enum/types/routeEnums';
          import { PERMISSION_PAGE } from '@/enum/types/permissionEnums';
          import catchImport from '@/router/utils';`)
          )
          node.body.push(t.exportDefaultDeclaration(ast))
        },
      },
    },
  }
}

module.exports = (route, parent, newFilePath) => {
  const ast = template.ast(`(
    {
      path: '${route.path}',
      name: RouteEnums.${route.name},
      meta: { 
        title: ('${route.title}'), 
        isHeader: ${route.isHeader}, 
        permission: PERMISSION_PAGE.${route.permission},
        record: true 
      },
      component: () => import('${route.component}').catch(catchImport),
    })`).expression

  if (newFilePath) {
    const {code} = babel.transformSync('', {
      plugins: [[newFilePlugin, {ast}]],
    })
    fs.writeFileSync(newFilePath, code, 'utf8')
  }

  if (newFilePath) newFilePath = '@/' + path.relative(global.root, newFilePath).replace(/\\/g, '/')
  const key = toPascal(route.name) + 'Route'

  const {code} = babel.transformFileSync(parent.filepath, {
    plugins: [[saveSubRoutePlugin, {ast, newFilePath, key, parentPath: parent.path}]],
  })
  
  fs.writeFileSync(parent.filepath, code, 'utf8')
}
