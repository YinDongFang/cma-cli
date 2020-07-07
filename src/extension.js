const path = './plugins/'
const list = ['js2json', 'svg-decorator', 'svg-viewer']

const plugins = list.map((name) => require(path + name))

function activate(context) {
  console.log('Congratulations, your extension "lifetouch-cma-cli" is now active!')
  console.log(`plugins list: ${list}`)

  plugins.forEach((plugin) => {
    plugin.activate(context)
  })
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
}
