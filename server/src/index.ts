import { fromHono } from 'chanfana'
import { Hono } from 'hono'
import { AppVersion } from './endpoints/appVersion'
import { AuthCheckRegistered } from './endpoints/authCheckRegistered'
import { AuthLogout } from './endpoints/authLogout'
import { AuthOtp } from './endpoints/authOtp'
import { AuthStatus } from './endpoints/authStatus'
import { AuthVerify } from './endpoints/authVerify'
import { ShortLinkCreate } from './endpoints/shortLinkCreate'
import type { AppEnv } from './types'
import { UserSync } from './endpoints/userSync'

// Start a Hono app
const app = new Hono<{ Bindings: AppEnv }>()

app.use('*', async (c, next) => {
  const url = new URL(c.req.url)
  console.log('[server] incoming request', c.req.method, url.origin + url.pathname)
  await next()
})

// Middleware to protect /openapi
app.use('/openapi', async (c, next) => {
  const secret = c.req.query('key')
  // 从环境变量读取校验参数，无兜底值
  const expectedKey = c.env.OPENAPI_KEY

  if (!expectedKey) {
    console.error('Critical: OPENAPI_KEY environment variable is not set!')
    return c.json({ error: 'Server Configuration Error: Missing API Key' }, 500)
  }

  if (secret !== expectedKey) {
    return c.json({ error: 'Unauthorized: Invalid or missing API docs key' }, 401)
  }
  await next()
})

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: '/openapi',
})

openapi.post('/api/auth/otp', AuthOtp)
openapi.post('/api/auth/verify', AuthVerify)
openapi.post('/api/auth/check-registered', AuthCheckRegistered)
openapi.post('/api/auth/status', AuthStatus)
openapi.post('/api/auth/logout', AuthLogout)

openapi.post('/api/users/sync', UserSync)

openapi.post('/api/links/shorten', ShortLinkCreate)

openapi.get('/api/app/version', AppVersion)

// Serve the App Homepage
app.get('/', async (c) => {
  return c.env.ASSETS.fetch(new URL('/index.html', c.req.url))
})

// Export the Hono app
export default app

export { UserStorage } from './UserStorage'
