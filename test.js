const {default: template} = require('@babel/template')

console.log(template.ast(`import { PERMISSION_PAGE } from '@/enum/types/permissionEnums';`))