import assert from 'node:assert/strict'

import { normalizeTabsList } from '../constants/Tabs'
import { getDefaultSyncPayload } from '../store/syncData'
import { isHttpsUrl, normalizeUrl } from './index'

assert.equal(isHttpsUrl('https://example.com'), true)
assert.equal(isHttpsUrl('http://example.com'), false)
assert.equal(isHttpsUrl('ftp://example.com'), false)

assert.equal(normalizeUrl('example.com/path'), 'https://example.com/path')
assert.equal(normalizeUrl('https://example.com/path'), 'https://example.com/path')
assert.equal(normalizeUrl('http://example.com/path'), null)

const normalizedTabs = normalizeTabsList([
  {
    name: 'custom_http',
    title: 'HTTP page',
    url: 'http://example.com',
    show: true,
    builtIn: false,
  },
])
assert.equal(
  normalizedTabs.some((tab) => tab.name === 'custom_http'),
  false,
)

assert.deepEqual(Object.keys(getDefaultSyncPayload()).sort(), [
  '$enableTextSelect',
  '$fabPosition',
  '$favorList',
  '$tabsList',
])
assert.deepEqual(getDefaultSyncPayload().$favorList, [])

console.log('app security helpers test passed')
