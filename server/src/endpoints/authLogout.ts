import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { BearerAuthorizationHeaderSchema, parseBearerToken } from '../authSecurity'
import { factory } from '../factory'
import { validationHook } from '../validation'

const AuthLogoutHeaderSchema = z.object({
  authorization: BearerAuthorizationHeaderSchema,
})

const AuthLogoutBodySchema = z.object({
  email: z.email(),
})

export const AuthLogout = factory.createHandlers(
  zValidator('header', AuthLogoutHeaderSchema, validationHook),
  zValidator('json', AuthLogoutBodySchema, validationHook),
  async (c) => {
    const { email } = c.req.valid('json')
    const { authorization } = c.req.valid('header')
    const token = parseBearerToken(authorization)

    if (!token) {
      return c.json({ success: true })
    }

    const id = c.env.USER_STORAGE.idFromName(email)
    const stub = c.env.USER_STORAGE.get(id)

    // 验证 token 是否匹配（防止恶意请求）
    const verifyResult = await stub.verifyToken(token)
    if (verifyResult.valid) {
      await stub.clearToken()
      console.log(`[AUTH] User ${email} logged out`)
    }

    // 无论 token 是否有效，都返回成功（避免信息泄露）
    return c.json({ success: true })
  },
)
