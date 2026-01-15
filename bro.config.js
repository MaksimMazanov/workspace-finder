const pkg = require('./package')

module.exports = {
  apiPath: 'stubs/api',
  webpackConfig: {
    output: {
      publicPath: `/static/${pkg.name}/${process.env.VERSION || pkg.version}/`
    }
  },
  /* use https://admin.bro-js.ru/ to create config, navigations and features */
  navigations: {
    'workspace-finder.main': '/workspace-finder',
    'link.workspace-finder.auth': '/auth'
  },
  features: {
    'workspace-finder': {
      // add your features here in the format [featureName]: { value: string }
    },
  },
  config: {
    'workspace-finder.api': '/api'
  },
  // Путь к кастомному HTML-шаблону prom-режима (оставьте undefined чтобы использовать дефолт)
  htmlTemplatePath: undefined
}
