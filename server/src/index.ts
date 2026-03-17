import { fromHono } from 'chanfana'
import { Hono } from 'hono'
import { AppVersion } from './endpoints/appVersion'
import { AuthCheckRegistered } from './endpoints/authCheckRegistered'
import { AuthLogout } from './endpoints/authLogout'
import { AuthOtp } from './endpoints/authOtp'
import { AuthStatus } from './endpoints/authStatus'
import { AuthVerify } from './endpoints/authVerify'
import { ShortLinkCreate } from './endpoints/shortLinkCreate'
import { UserSync } from './endpoints/userSync'

// Start a Hono app
const app = new Hono<{ Bindings: Env }>()
console.log('Hono app initialized')

app.use('*', async (c, next) => {
  console.log('[server] incoming request', c.req.method, c.req.url)
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

console.log('Registering Auth endpoints...')
openapi.post('/api/auth/otp', AuthOtp)
openapi.post('/api/auth/verify', AuthVerify)
openapi.post('/api/auth/check-registered', AuthCheckRegistered)
openapi.post('/api/auth/status', AuthStatus)
openapi.post('/api/auth/logout', AuthLogout)
console.log('Auth endpoints registered.')

console.log('Registering User endpoints...')
openapi.post('/api/users/:userEmail/sync', UserSync)
console.log('User endpoints registered.')

console.log('Registering Link endpoints...')
openapi.post('/api/links/shorten', ShortLinkCreate)
console.log('Link endpoints registered.')

console.log('Registering App endpoints...')
openapi.get('/api/app/version', AppVersion)
console.log('App endpoints registered.')

// Serve the App Homepage
app.get('/', async (c) => {
  return c.env.ASSETS.fetch(new URL('/index.html', c.req.url))
})

// Export the Hono app
export default app

export { UserStorage } from './UserStorage'
