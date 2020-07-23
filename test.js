const path = require('path')

const global = require(path.resolve(__dirname, './src/plugins/route-manager/global'))

global.root = 'E:/cm-admin/src'
global.routeEntryFilePath = 'E:/cm-admin/src/router/routes.js'

const save = require('./src/plugins/route-manager/manipulations/utils/save')

save(
  {
    path: 'keypath',
    name: 'ENUM',
    permission: 'PERMISSION',
    title: 'route.title.name',
    isHeader: true,
    component: '@view/test.vue',
  },
  {
    path: 'item',
    filepath: 'E:/cm-admin/src/router/modules/setting/billSettingRoutes.js',
  },
  'E:/cm-admin/src/router/modules/setting/billSettingRoutes1.js'
)
