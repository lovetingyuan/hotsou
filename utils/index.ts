import { TabsList } from '@/constants/Tabs'

/**
 * RegExps.
 * A URL must match #1 and then at least one of #2/#3.
 * Use two levels of REs to avoid REDOS.
 */

let protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/

let localhostDomainRE = /^localhost[:?\d]*(?:[^:?\d]\S*)?$/
let nonLocalhostDomainRE = /^[^\s.]+\.\S{2,}$/

/**
 * Loosely validate a URL `string`.
 *
 * @param {String} string
 * @return {Boolean}
 */
export function isHttpUrl(string: string) {
  if (typeof string !== 'string') {
    return false
  }
  if (!string.startsWith('http://') && !string.startsWith('https://')) {
    return false
  }

  let match = string.match(protocolAndDomainRE)
  if (!match) {
    return false
  }

  let everythingAfterProtocol = match[1]
  if (!everythingAfterProtocol) {
    return false
  }

  return !!(
    localhostDomainRE.test(everythingAfterProtocol) ||
    nonLocalhostDomainRE.test(everythingAfterProtocol)
  )
}

export function getPageIcon(page?: (typeof TabsList)[0]) {
  const defaultIcon = require('../assets/images/favicon.png')
  if (!page) {
    return defaultIcon
  }
  if (page.icon) {
    return { uri: page.icon }
  }
  return defaultIcon
}
