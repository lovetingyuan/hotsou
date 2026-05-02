import { Bool, OpenAPIRoute, Str } from 'chanfana'
import { z } from 'zod'
import { BearerAuthorizationHeaderSchema, parseBearerToken } from '../authSecurity'
import { AppContext } from '../types'

const AuthStatusRequestSchema = {
  tags: ['Auth'],
  summary: 'Check login status and refresh token if needed',
  request: {
    headers: z.object({
      authorization: BearerAuthorizationHeaderSchema,
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            email: z.string().email(),
          }),
        },
      },
    },
  },
  responses: {
    '200': {
      description: 'Status check result',
      content: {
        'application/json': {
          schema: z.object({
            success: Bool(),
            valid: Bool(),
            newToken: Str({ required: false }),
          }),
        },
      },
    },
  },
}

export class AuthStatus extends OpenAPIRoute {
  schema = AuthStatusRequestSchema

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof AuthStatusRequestSchema>()
    const { email } = data.body
    const token = parseBearerToken(data.headers.authorization)

    if (!token) {
      return {
        success: true,
        valid: false,
      }
    }

    const id = c.env.USER_STORAGE.idFromName(email)
    const stub = c.env.USER_STORAGE.get(id)

    const verifyResult = await stub.verifyToken(token)

    // Token 无效或已过期
    if (!verifyResult.valid) {
      return {
        success: true,
        valid: false,
      }
    }

    // Token 有效，检查是否需要刷新
    if (verifyResult.needRefresh) {
      const newToken = await stub.refreshToken(token)
      if (newToken) {
        console.log(`[AUTH] Token refreshed for ${email}`)
        return {
          success: true,
          valid: true,
          newToken: newToken,
        }
      }
    }

    // Token 有效，不需要刷新
    return {
      success: true,
      valid: true,
    }
  }
}
