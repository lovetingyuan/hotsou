import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { after, beforeEach, test } from 'node:test'

const state = { toasts: [], expired: 0 }
globalThis.__hotsouApiTest = state

const mocks = {
  'react-native': `
    export const Platform = { OS: 'android' };
    export const ToastAndroid = {
      SHORT: 0,
      show(message) { globalThis.__hotsouApiTest.toasts.push(message); }
    };
  `,
  '@/api/baseUrl': `export const BASE_URL = 'https://api.example.com';`,
  '@/utils/authSession': `
    export async function markAuthExpired() { globalThis.__hotsouApiTest.expired++; }
  `,
}
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier in mocks) {
      return {
        url: `data:text/javascript,${encodeURIComponent(mocks[specifier])}`,
        shortCircuit: true,
      }
    }
    if (
      specifier === './api' &&
      context.parentURL === new URL('./checkAppUpdate.ts', import.meta.url).href
    ) {
      return nextResolve('./api.ts', context)
    }
    return nextResolve(specifier, context)
  },
})
const { request, userApi, ApiError } = await import('./api.ts')
const { default: checkAppUpdate } = await import('./checkAppUpdate.ts')

beforeEach((t) => {
  state.toasts.length = 0
  state.expired = 0
  // Keep the retry tests fast while still exercising the delay and cancellation checks.
  t.mock.method(globalThis, 'setTimeout', (callback) => {
    queueMicrotask(callback)
    return 0
  })
  t.mock.method(console, 'log', () => {})
})
after(() => {
  hooks.deregister()
  delete globalThis.__hotsouApiTest
})

const handshakeError = () =>
  new TypeError('fetch failed: javax.net.ssl.SSLHandshakeException: connection closed')

test('a transient GET handshake failure retries once and preserves request options', async (t) => {
  let attempts = 0
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    if (++attempts === 1) {
      throw handshakeError()
    }
    return Response.json({ success: true })
  })
  assert.deepEqual(await request('/version', { headers: { 'X-Test': 'value' } }), { success: true })
  assert.equal(fetchMock.mock.callCount(), 2)
  for (const {
    arguments: [url, options],
  } of fetchMock.mock.calls) {
    assert.equal(url, 'https://api.example.com/version')
    assert.equal(options.headers.get('X-Test'), 'value')
  }
  assert.deepEqual(state.toasts, [])
})

test('persistent GET failures stop after two attempts and show one friendly error', async (t) => {
  const error = handshakeError()
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    throw error
  })
  await assert.rejects(request('/version'), (caught) => caught === error)
  assert.equal(fetchMock.mock.callCount(), 2)
  assert.deepEqual(state.toasts, ['网络连接失败，请稍后重试'])
})

test('POST failures are never retried', async (t) => {
  const error = handshakeError()
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    throw error
  })
  await assert.rejects(request('/write', { method: 'POST' }), (caught) => caught === error)
  assert.equal(fetchMock.mock.callCount(), 1)
})

test('automatic update checks fail silently after their bounded retry', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    throw handshakeError()
  })
  await assert.rejects(checkAppUpdate())
  assert.equal(fetchMock.mock.callCount(), 2)
  assert.deepEqual(state.toasts, [])
})

test('background sync failures are silent and never replay writes', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    throw handshakeError()
  })
  await assert.rejects(userApi.sync('user@example.com', 'token', { set: { key: 'value' } }))
  assert.equal(fetchMock.mock.callCount(), 1)
  assert.deepEqual(state.toasts, [])
})

test('silent requests still expire authentication and notify on 401', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ error: 'Unauthorized' }, { status: 401 }),
  )
  await assert.rejects(
    request('/private', undefined, { silent: true }),
    (error) => error instanceof ApiError && error.status === 401,
  )
  assert.equal(fetchMock.mock.callCount(), 1)
  assert.equal(state.expired, 1)
  assert.deepEqual(state.toasts, ['登录已失效，请重新验证邮箱'])
})

test('HTTP errors do not trigger transport retries', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ error: 'Service unavailable' }, { status: 503 }),
  )
  await assert.rejects(
    request('/version'),
    (error) => error instanceof ApiError && error.status === 503,
  )
  assert.equal(fetchMock.mock.callCount(), 1)
  assert.deepEqual(state.toasts, ['Service unavailable'])
})

test('cancellation never retries or shows a toast', async (t) => {
  const error = new DOMException('Cancelled', 'AbortError')
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    throw error
  })
  await assert.rejects(request('/version'), (caught) => caught === error)
  assert.equal(fetchMock.mock.callCount(), 1)
  assert.deepEqual(state.toasts, [])
})

test('cancellation during retry delay prevents the second request', async (t) => {
  const controller = new AbortController()
  t.mock.method(globalThis, 'setTimeout', (callback) => {
    controller.abort()
    queueMicrotask(callback)
    return 0
  })
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
    throw handshakeError()
  })
  await assert.rejects(request('/version', { signal: controller.signal }))
  assert.equal(fetchMock.mock.callCount(), 1)
  assert.deepEqual(state.toasts, [])
})

test('invalid JSON is caught without retrying a successful HTTP response', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => new Response('invalid JSON'))
  await assert.rejects(request('/version', undefined, { silent: true }), SyntaxError)
  assert.equal(fetchMock.mock.callCount(), 1)
  assert.deepEqual(state.toasts, [])
})
