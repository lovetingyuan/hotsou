import { Bool, OpenAPIRoute, Str } from 'chanfana'
import { z } from 'zod'
import { normalizeAuthEmail } from '../authEmail'
import { AppContext } from '../types'

const AuthCheckRegisteredSchema = {
  tags: ['Auth'],
  summary: 'Check if email is already registered',
  request: {
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
      description: 'Registration status',
      content: {
        'application/json': {
          schema: z.object({
            success: Bool(),
            message: Str(),
          }),
        },
      },
    },
  },
}

export class AuthCheckRegistered extends OpenAPIRoute {
  schema = AuthCheckRegisteredSchema

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof AuthCheckRegisteredSchema>()
    void normalizeAuthEmail(data.body.email)

    return {
      success: true,
      message: '如果邮箱可用，可继续请求验证码',
    }
  }
}
