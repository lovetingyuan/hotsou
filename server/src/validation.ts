import type { Hook } from '@hono/zod-validator'
import type { Env } from 'hono'

export const validationHook: Hook<unknown, Env, string> = (result, c) => {
  if (!result.success) {
    return c.json({ success: false, error: '请求参数无效' }, 400)
  }
}
