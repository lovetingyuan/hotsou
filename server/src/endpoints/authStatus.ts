import { Bool, OpenAPIRoute, Str } from 'chanfana'
import { z } from 'zod'
import { AppContext } from '../types'

const AuthStatusRequestSchema = {
  tags: ['Auth'],
  summary: 'Check login status and refresh token if needed',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            email: z.string().email(),
            token: z.string().uuid(),
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
    const { email, token } = data.body

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
