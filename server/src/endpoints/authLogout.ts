import { Bool, OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { AppContext } from '../types'

const AuthLogoutRequestSchema = {
  tags: ['Auth'],
  summary: 'Logout and clear token',
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
      description: 'Logout successful',
      content: {
        'application/json': {
          schema: z.object({
            success: Bool(),
          }),
        },
      },
    },
  },
}

export class AuthLogout extends OpenAPIRoute {
  schema = AuthLogoutRequestSchema

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof AuthLogoutRequestSchema>()
    const { email, token } = data.body

    const id = c.env.USER_STORAGE.idFromName(email)
    const stub = c.env.USER_STORAGE.get(id)

    // 验证 token 是否匹配（防止恶意请求）
    const verifyResult = await stub.verifyToken(token)
    if (verifyResult.valid) {
      await stub.clearToken()
      console.log(`[AUTH] User ${email} logged out`)
    }

    // 无论 token 是否有效，都返回成功（避免信息泄露）
    return {
      success: true,
    }
  }
}
