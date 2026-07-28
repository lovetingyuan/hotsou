import { AppVersion } from './endpoints/appVersion'
import { AuthCheckRegistered } from './endpoints/authCheckRegistered'
import { AuthLogout } from './endpoints/authLogout'
import { AuthOtp } from './endpoints/authOtp'
import { AuthStatus } from './endpoints/authStatus'
import { AuthVerify } from './endpoints/authVerify'
import { ShortLinkCreate } from './endpoints/shortLinkCreate'
import { UserSync } from './endpoints/userSync'
import { factory } from './factory'

// Start a Hono app
const app = factory.createApp()

app.use('*', async (c, next) => {
  const url = new URL(c.req.url)
  console.log('[server] incoming request', c.req.method, url.origin + url.pathname)
  await next()
})

app.post('/api/auth/otp', ...AuthOtp)
app.post('/api/auth/verify', ...AuthVerify)
app.post('/api/auth/check-registered', ...AuthCheckRegistered)
app.post('/api/auth/status', ...AuthStatus)
app.post('/api/auth/logout', ...AuthLogout)

app.post('/api/users/sync', ...UserSync)

app.post('/api/links/shorten', ...ShortLinkCreate)

app.get('/api/app/version', ...AppVersion)

// Serve the App Homepage
app.get('/', async (c) => {
  return c.env.ASSETS.fetch(new URL('/index.html', c.req.url))
})

// Export the Hono app
export default app

export { UserStorage } from './UserStorage'
