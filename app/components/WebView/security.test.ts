import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = dirname(fileURLToPath(import.meta.url))
const webViewSource = readFileSync(resolve(currentDir, 'index.tsx'), 'utf8')
const zhihuSource = readFileSync(resolve(currentDir, '../../screens/ZhihuScreen.tsx'), 'utf8')

assert.equal(zhihuSource.includes('SESSIONID='), false)
assert.equal(zhihuSource.includes('cookie='), false)

assert.equal(webViewSource.includes('cookie?: string'), false)
assert.equal(webViewSource.includes('Cookie:'), false)
assert.match(webViewSource, /mixedContentMode=\{'never'\}/)
assert.match(webViewSource, /originWhitelist=\{\['https:\/\/\*'\]\}/)
assert.match(webViewSource, /incognito=\{true\}/)
assert.match(webViewSource, /cacheEnabled=\{false\}/)
assert.match(webViewSource, /request\.url\.startsWith\('https:\/\/'\)/)

console.log('webview security static checks passed')
