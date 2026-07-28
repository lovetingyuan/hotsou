import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { normalizeAuthEmail } from '../authEmail'
import { factory } from '../factory'
import { validationHook } from '../validation'

const AuthCheckRegisteredBodySchema = z.object({
  email: z.email(),
})

export const AuthCheckRegistered = factory.createHandlers(
  zValidator('json', AuthCheckRegisteredBodySchema, validationHook),
  (c) => {
    const { email } = c.req.valid('json')
    void normalizeAuthEmail(email)

    return c.json({
      success: true,
      message: '如果邮箱可用，可继续请求验证码',
    })
  },
)
