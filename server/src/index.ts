import { fromHono } from 'chanfana'
import { Hono } from 'hono'
import { TaskCreate } from './endpoints/taskCreate'
import { TaskDelete } from './endpoints/taskDelete'
import { TaskFetch } from './endpoints/taskFetch'
import { TaskList } from './endpoints/taskList'
import { UserApplicationData } from './endpoints/userApplicationData'
import { UserApplicationDataCreate } from './endpoints/userApplicationDataCreate'
import { UserApplicationDataDelete } from './endpoints/userApplicationDataDelete'
import { UserApplicationDataUpdate } from './endpoints/userApplicationDataUpdate'

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

// Register OpenAPI endpoints
openapi.get('/api/tasks', TaskList)
openapi.post('/api/tasks', TaskCreate)
openapi.get('/api/tasks/:taskSlug', TaskFetch)
openapi.delete('/api/tasks/:taskSlug', TaskDelete)

console.log('Registering User endpoints...')
openapi.get('/api/users/:userEmail/application-data', UserApplicationData)
openapi.post('/api/users/:userEmail/application-data', UserApplicationDataCreate)
openapi.put('/api/users/:userEmail/application-data', UserApplicationDataUpdate)
openapi.delete('/api/users/:userEmail/application-data', UserApplicationDataDelete)
console.log('User endpoints registered.')

// You may also register routes for non OpenAPI directly on Hono
// app.get('/test', (c) => c.text('Hono!'))

// Export the Hono app
export default app

export { UserStorage } from './UserStorage'
