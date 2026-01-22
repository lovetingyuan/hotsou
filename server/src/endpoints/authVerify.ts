import { Bool, OpenAPIRoute, Str } from 'chanfana'
import { z } from 'zod'
import { AppContext } from '../types'

const AuthVerifyRequestSchema = {
  tags: ['Auth'],
  summary: 'Verify OTP and get token',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            email: z.string().email(),
            otp: z.string().length(6),
          }),
        },
      },
    },
  },
  responses: {
    '200': {
      description: 'Authentication successful',
      content: {
        'application/json': {
          schema: z.object({
            success: Bool(),
            token: Str(),
            isNewUser: Bool(),
          }),
        },
      },
    },
    '400': {
      description: 'Invalid OTP',
      content: {
        'application/json': {
          schema: z.object({
            success: Bool(),
            error: Str(),
          }),
        },
      },
    },
  },
}

export class AuthVerify extends OpenAPIRoute {
  schema = AuthVerifyRequestSchema

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof AuthVerifyRequestSchema>()
    const { email, otp } = data.body

    const id = c.env.USER_STORAGE.idFromName(email)
    const stub = c.env.USER_STORAGE.get(id)

    const isValid = await stub.verifyOtp(otp)

    if (!isValid) {
      return c.json(
        {
          success: false,
          error: '验证码错误或已过期',
        },
        400,
      )
    }

    // 生成 Token
    const token = crypto.randomUUID()

    // 保存 Token，并获取是否为新用户
    const { isNewUser } = await stub.saveToken(token, email)

    console.log(`[AUTH] User ${email} logged in, isNewUser: ${isNewUser}`)

    return {
      success: true,
      token: token,
      isNewUser: isNewUser,
    }
  }
}
