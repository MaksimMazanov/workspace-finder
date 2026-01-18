import { getNavigation, getNavigationValue, getConfigValue } from '@brojs/cli'

import pkg from '../../package.json'

const baseUrl = getNavigationValue(`${pkg.name}.main`)
const navs = getNavigation()
const makeUrl = (url) => baseUrl + url

// Determine API base URL
// The config value should be set in admin.bro-js.ru
// But we also handle the case where it's accidentally set to the frontend path
const configApiBase = getConfigValue(`${pkg.name}.api`)

// If the config value looks like a frontend path (contains /ms/), 
// extract just /api from it. Otherwise use the config value as-is.
let apiBase = configApiBase || '/api'
if (apiBase && apiBase.includes('/ms/') && apiBase !== '/api') {
  // If someone accidentally set it to '/ms/workspace-finder', use '/api' instead
  apiBase = '/api'
}

// Log URLs for debugging
console.log('URLs Configuration:', {
  baseUrl,
  apiBase,
  configApiBase,
  pkgName: pkg.name,
  navigations: {
    main: getNavigationValue(`${pkg.name}.main`),
    login: getNavigationValue(`${pkg.name}.login`)
  }
})

export const URLs = {
  baseUrl,
  apiBase,
  login: makeUrl('/login'),
  auth: {
    url: makeUrl(navs[`link.${pkg.name}.auth`]),
    isOn: Boolean(navs[`link.${pkg.name}.auth`])
  },
}
