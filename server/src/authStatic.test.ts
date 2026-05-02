import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const indexSource = readFileSync(new URL('./index.ts', import.meta.url), 'utf8')
const userSyncSource = readFileSync(new URL('./endpoints/userSync.ts', import.meta.url), 'utf8')
const authCheckRegisteredSource = readFileSync(
  new URL('./endpoints/authCheckRegistered.ts', import.meta.url),
  'utf8',
)
const authVerifySource = readFileSync(new URL('./endpoints/authVerify.ts', import.meta.url), 'utf8')
const userStorageSource = readFileSync(new URL('./UserStorage.ts', import.meta.url), 'utf8')

assert.equal(indexSource.includes('/api/users/:userEmail/sync'), false)
assert.match(indexSource, /openapi\.post\('\/api\/users\/sync', UserSync\)/)

assert.equal(userSyncSource.includes('authorization: z.string().optional()'), false)
assert.match(userSyncSource, /authorization: BearerAuthorizationHeaderSchema/)
assert.match(userSyncSource, /email: z\.string\(\)\.email\(\)/)

assert.equal(authCheckRegisteredSource.includes('registered:'), false)
assert.match(authCheckRegisteredSource, /message:/)

assert.match(authVerifySource, /regex\(\/\^\\d\{6\}\$\//)
assert.match(userStorageSource, /await this\.clearToken\(\)/)

console.log('server auth static checks passed')
