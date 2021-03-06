const vscode = require('vscode')

const path = './plugins/'
const list = [
  'vue-store',
  'components-ref',
  'route-manager',
  'svg-decorator',
  'svg-viewer',
  'vue-template',
  'js2json',
]

async function activate(context) {
  console.log('Congratulations, your extension "lifetouch-cma-cli" is now active!')
  console.log(`plugins list: ${list}`)

  const output = vscode.window.createOutputChannel('CMA Cli')

  list.forEach((name) => {
    try {
      const plugin = require(path + name)
      plugin.activate(context, output)
    } catch (error) {
      output.appendLine(`${name} start failed`)
      console.log(error)
    }
  })
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
}
