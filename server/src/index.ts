import { fromHono } from 'chanfana'
import { Hono } from 'hono'
import * as cheerio from 'cheerio'
import { AppVersion } from './endpoints/appVersion'
import { AuthOtp } from './endpoints/authOtp'
import { AuthVerify } from './endpoints/authVerify'
import { AuthCheckRegistered } from './endpoints/authCheckRegistered'
import { AuthStatus } from './endpoints/authStatus'
import { AuthLogout } from './endpoints/authLogout'
import { UserSync } from './endpoints/userSync'
import { getHomeHtml } from './pages/home'

// Start a Hono app
const app = new Hono<{ Bindings: Env }>()
console.log('Hono app initialized')

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

console.log('Registering App endpoints...')
openapi.get('/api/app/version', AppVersion)
console.log('App endpoints registered.')

// Serve the App Homepage
let cachedVersion = ''
let cacheTime = 0
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

app.get('/', async (c) => {
  let version = ''
  const now = Date.now()

  if (cachedVersion && now - cacheTime < CACHE_TTL) {
    version = cachedVersion
  } else {
    try {
      const html = await fetch('https://github.com/lovetingyuan/hotsou/releases/').then((r) =>
        r.text()
      )
      const $ = cheerio.load(html)
      const $item = $('.Box-body').first()
      version = $item.find('a').first().text().trim()

      if (version) {
        cachedVersion = version
        cacheTime = now
      }
    } catch (err) {
      console.error('Error fetching version for homepage:', err)
      // 如果获取失败且有旧缓存，则使用旧缓存
      if (cachedVersion) {
        version = cachedVersion
      }
    }
  }

  const downloadUrl = version
    ? `https://ghfast.top/https://github.com/lovetingyuan/hotsou/releases/download/${version}/hotsou-${version.replace('v', '')}.apk`
    : '#'

  return c.html(getHomeHtml(downloadUrl))
})

// Export the Hono app
export default app

export { UserStorage } from './UserStorage'
