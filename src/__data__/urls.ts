import { getNavigation, getNavigationValue, getConfigValue } from '@brojs/cli'

import pkg from '../../package.json'

const baseUrl = getNavigationValue(`${pkg.name}.main`)
const navs = getNavigation()
const makeUrl = (url) => baseUrl + url

// Determine API base URL from config
// On production: if baseUrl is set, we should use baseUrl/api
// On development: use /api from config
const configApiBase = getConfigValue(`${pkg.name}.api`)

// If baseUrl exists and is not root, use baseUrl as API base (e.g., /ms/workspace-finder)
// Otherwise use the config value (/api)
let apiBase = configApiBase || '/api'

// If config contains /ms/ path, it's likely the frontend path mistakenly used
// In that case, API should be accessible from the same base
if (apiBase && apiBase.includes('/ms/') && baseUrl && baseUrl.includes('/ms/')) {
  // Both have /ms/, so API might be at the same base path
  apiBase = baseUrl
} else if (apiBase && apiBase.includes('/ms/') && apiBase !== '/api') {
  // Config has /ms/ but baseUrl doesn't, use /api instead
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
    login: getNavigationValue(`${pkg.name}.login`),
    register: getNavigationValue(`${pkg.name}.register`)
  }
})

export const URLs = {
  baseUrl,
  apiBase,
  login: getNavigationValue(`${pkg.name}.login`) || makeUrl('/login'),
  register: getNavigationValue(`${pkg.name}.register`) || makeUrl('/register'),
  auth: {
    url: makeUrl(navs[`link.${pkg.name}.auth`]),
    isOn: Boolean(navs[`link.${pkg.name}.auth`])
  },
}
