/*
 * @Author: Ian
 * @Email: 1136005348@qq.com
 * @Date: 2020-07-09 22:26:15
 * @LastEditTime: 2020-07-20 17:48:51
 * @LastEditors: Ian
 * @Description:
 */

const path = require('path')
const webpack = require('webpack')
const memoryfs = require('memory-fs')

module.exports = (root, entry, context) => {
  const compiler = webpack({
    entry,
    context,
    mode: 'development',
    target: 'node',
    resolve: {
      alias: {
        '@': root,
      },
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                cwd: context,
                presets: [['@babel/preset-env', {targets: {node: 'current'}}]],
                plugins: [
                  path.resolve(__dirname, './plugins/replace-import-to-literal-string.js'),
                  path.resolve(__dirname, './plugins/normalize-route-object'),
                ],
              },
            },
            {
              loader: path.resolve(__dirname, './loaders/filepath-directive-loader.js'),
            },
          ],
        },
      ],
    },
  })

  compiler.outputFileSystem = new memoryfs()

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err)

      resolve(stats)
    })
  })
}
