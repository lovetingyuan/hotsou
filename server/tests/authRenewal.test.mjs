import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

import { build } from 'esbuild'
import { Miniflare } from 'miniflare'

import { AUTH_TOKEN_EXPIRY_MS, verifyStoredToken } from '../src/authToken.ts'

const token = '123e4567-e89b-42d3-a456-426614174000'
const otherToken = '223e4567-e89b-42d3-a456-426614174000'
const email = 'renewal@example.com'
const day = 24 * 60 * 60 * 1000

assert.deepEqual(
  verifyStoredToken({ storedToken: token, token, createdAt: 0, now: AUTH_TOKEN_EXPIRY_MS - 1 }),
  { valid: true, expired: false },
)
assert.deepEqual(
  verifyStoredToken({ storedToken: token, token, createdAt: 0, now: AUTH_TOKEN_EXPIRY_MS }),
  { valid: false, expired: true },
)

// Run the production routes and Durable Object in workerd with isolated, local storage.
const bundled = await build({
  stdin: {
    contents: `
      import app from '../src/index.ts'
      import { UserStorage as StoredUser } from '../src/UserStorage.ts'
      export class UserStorage extends StoredUser {
        async seedToken(token, createdAt) {
          await this.ctx.storage.put({ auth_token: token, auth_token_created_at: createdAt })
        }
        async readTokenState() {
          return Object.fromEntries(await this.ctx.storage.get(['auth_token', 'auth_token_created_at']))
        }
      }
      export default {
        async fetch(request, env, ctx) {
          const path = new URL(request.url).pathname
          if (path.startsWith('/_test/')) {
            const data = await request.json()
            const stub = env.USER_STORAGE.get(env.USER_STORAGE.idFromName(data.email))
            if (path === '/_test/seed') await stub.seedToken(data.token, data.createdAt)
            return Response.json(await stub.readTokenState())
          }
          return app.fetch(request, env, ctx)
        }
      }
    `,
    resolveDir: fileURLToPath(new URL('.', import.meta.url)),
    sourcefile: 'auth-renewal-worker.js',
  },
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'browser',
  external: ['cloudflare:workers'],
})

const mf = new Miniflare({
  modules: true,
  script: bundled.outputFiles[0].text,
  compatibilityDate: '2025-09-27',
  durableObjects: { USER_STORAGE: 'UserStorage' },
})

async function post(path, bearerToken = token, body = {}) {
  const response = await mf.dispatchFetch(`http://localhost${path}`, {
    method: 'POST',
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${bearerToken}` },
    body: JSON.stringify({ email, ...body }),
  })
  return { status: response.status, data: await response.json() }
}

try {
  const originalCreatedAt = Date.now() - AUTH_TOKEN_EXPIRY_MS + day
  await post('/_test/seed', token, { token, createdAt: originalCreatedAt })

  // Losing a successful renewal response must leave the saved token usable on retry.
  await post('/api/auth/status')
  assert.deepEqual(await post('/api/auth/status'), {
    status: 200,
    data: { success: true, valid: true, newToken: token },
  })
  const renewed = (await post('/_test/state')).data
  assert.equal(renewed.auth_token, token)
  assert.ok(renewed.auth_token_created_at > originalCreatedAt)
  assert.ok(Date.now() - renewed.auth_token_created_at < day)

  // A session older than 90 days in total is still valid relative to its latest renewal.
  assert.equal(
    verifyStoredToken({
      storedToken: token,
      token,
      createdAt: renewed.auth_token_created_at,
      now: originalCreatedAt + AUTH_TOKEN_EXPIRY_MS + day,
    }).valid,
    true,
  )

  const concurrentResults = await Promise.all(
    Array.from({ length: 6 }, (_, index) =>
      index % 2 === 0 ? post('/api/auth/status') : post('/api/users/sync', token, { get: [] }),
    ),
  )
  assert.ok(concurrentResults.every((result) => result.status === 200 && result.data.success))
  assert.ok(concurrentResults.filter((_, index) => index % 2 === 0).every((r) => r.data.valid))

  // Invalid tokens must neither renew nor delete the current session.
  const beforeInvalid = (await post('/_test/state')).data
  assert.equal((await post('/api/auth/status', otherToken)).data.valid, false)
  assert.deepEqual((await post('/_test/state')).data, beforeInvalid)

  await post('/api/auth/logout')
  assert.equal((await post('/api/auth/status')).data.valid, false)
  assert.equal((await post('/api/users/sync', token, { get: [] })).status, 401)

  // Another login still replaces the session; renewal cannot resurrect its old token.
  await post('/_test/seed', otherToken, { token: otherToken, createdAt: Date.now() })
  assert.equal((await post('/api/auth/status')).data.valid, false)
  assert.equal((await post('/api/auth/status', otherToken)).data.valid, true)

  await post('/_test/seed', token, { token, createdAt: Date.now() - AUTH_TOKEN_EXPIRY_MS - day })
  assert.deepEqual((await post('/api/auth/status')).data, { success: true, valid: false })
  assert.deepEqual((await post('/_test/state')).data, {})
  assert.equal((await post('/api/auth/status')).data.valid, false)

  console.log('auth renewal runtime tests passed')
} finally {
  await mf.dispose()
}
