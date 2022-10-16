// import { createMiddleware } from './module.middleware'
// import plugin from './module.plugin'
import path from 'path'

import fs from 'fs-extra'

const optionName = 'nuxt-htaccess-generator'

module.exports = async function(moduleOptions) {
  const consola = require('consola')
  const options = Object.assign(
    {},
    this.options[optionName],
    moduleOptions || {}
  )
  const { enabled } = options
  if (enabled === false) {
    consola.info('Skip activation of nuxt-apache-config module')
    return false
  }
  consola.info('Add nuxt-apache-config module to server middleware')

  const xmlGeneratePath = path.resolve(
    this.options.srcDir,
    path.join('static', '/.htaccess')
  )

  fs.removeSync(xmlGeneratePath)

  const htaccess = createHtaccess(options)

  await fs.writeFile(xmlGeneratePath, htaccess)

  return true
}

module.exports.meta = require('../package.json')

function createHtaccess(options) {
  var htaccessConfig = ''
  if (options.https && !options.redirect) {
    htaccessConfig += 'RewriteEngine On\n'
  }
  if (options.https) {
    htaccessConfig +=
      'RewriteCond %{HTTPS} off\nRewriteRule (.*) https://%{HTTP_HOST}%{REQUEST_URI} [R,L]\n\n'
  }

  if (options.redirect) {
    htaccessConfig += 'ErrorDocument 404 https://%{HTTP_HOST}/'
    if (options.redirectUrl) {
      htaccessConfig += options.redirection
    }
    htaccessConfig += '\n\n'
  } else {
    htaccessConfig += 'RewriteCond %{REQUEST_FILENAME} !-f\nRewriteCond %{REQUEST_FILENAME} !-d\nRewriteRule . /index.html [L]'
  }

  if (options.onlyGET) {
    htaccessConfig +=
      '<LimitExcept GET>\nRequire valid-user\n</LimitExcept>\n\n'
  }

  return htaccessConfig
}
