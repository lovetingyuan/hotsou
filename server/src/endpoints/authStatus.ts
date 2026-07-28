import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { BearerAuthorizationHeaderSchema, parseBearerToken } from '../authSecurity'
import { factory } from '../factory'
import { validationHook } from '../validation'

const AuthStatusHeaderSchema = z.object({
  authorization: BearerAuthorizationHeaderSchema,
})

const AuthStatusBodySchema = z.object({
  email: z.email(),
})

export const AuthStatus = factory.createHandlers(
  zValidator('header', AuthStatusHeaderSchema, validationHook),
  zValidator('json', AuthStatusBodySchema, validationHook),
  async (c) => {
    const { email } = c.req.valid('json')
    const { authorization } = c.req.valid('header')
    const token = parseBearerToken(authorization)

    if (!token) {
      return c.json({
        success: true,
        valid: false,
      })
    }

    const id = c.env.USER_STORAGE.idFromName(email)
    const stub = c.env.USER_STORAGE.get(id)

    const verifyResult = await stub.verifyToken(token)

    // Token 无效或已过期
    if (!verifyResult.valid) {
      return c.json({
        success: true,
        valid: false,
      })
    }

    const newToken = await stub.refreshToken(token)
    if (!newToken) {
      return c.json({
        success: true,
        valid: false,
      })
    }

    console.log(`[AUTH] Token refreshed for ${email}`)
    return c.json({
      success: true,
      valid: true,
      newToken,
    })
  },
)
