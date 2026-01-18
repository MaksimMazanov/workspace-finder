import { getNavigation, getNavigationValue, getConfigValue } from '@brojs/cli'

import pkg from '../../package.json'

const baseUrl = getNavigationValue(`${pkg.name}.main`)
const navs = getNavigation()
const makeUrl = (url) => baseUrl + url

// Determine API base URL
// The API base should always be from config (which is /api)
// This is independent of where the frontend is deployed
const apiBase = getConfigValue(`${pkg.name}.api`)

export const URLs = {
  baseUrl,
  apiBase,
  login: makeUrl('/login'),
  auth: {
    url: makeUrl(navs[`link.${pkg.name}.auth`]),
    isOn: Boolean(navs[`link.${pkg.name}.auth`])
  },
}
