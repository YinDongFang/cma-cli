const vscode = require('vscode')

const path = './plugins/'
const list = ['js2json', 'svg-decorator', 'svg-viewer', 'vue-template', 'route-manager']

const plugins = list.map((name) => require(path + name))

async function activate(context) {
  console.log('Congratulations, your extension "lifetouch-cma-cli" is now active!')
  console.log(`plugins list: ${list}`)

  const output = vscode.window.createOutputChannel('CMA Cli')

  plugins.forEach((plugin) => {
    plugin.activate(context, output)
  })
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
}
