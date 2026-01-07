import { ImageSourcePropType } from 'react-native'

import { TabsList } from '@/constants/Tabs'

export class SimpleCrypto {
  private key: string

  constructor(key: string) {
    this.key = key
  }

  private xorCipher(text: string): string {
    return text
      .split('')
      .map((char, index) =>
        String.fromCharCode(char.charCodeAt(0) ^ this.key.charCodeAt(index % this.key.length))
      )
      .join('')
  }

  private toBase64(text: string): string {
    return btoa(encodeURIComponent(text))
  }

  private fromBase64(base64: string): string {
    return decodeURIComponent(atob(base64))
  }

  public encrypt(plaintext: string): string {
    const xored = this.xorCipher(plaintext)
    return this.toBase64(xored)
  }

  public decrypt(ciphertext: string): string {
    const decoded = this.fromBase64(ciphertext)
    return this.xorCipher(decoded)
  }
}

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
