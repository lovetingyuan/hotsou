import { Bool, OpenAPIRoute, Str } from 'chanfana'
import { z } from 'zod'
import { normalizeAuthEmail } from '../authEmail'
import { AppContext } from '../types'
import type { OtpVerificationFailureReason } from '../authSecurity'

const OTP_ERROR_MESSAGES: Record<OtpVerificationFailureReason, string> = {
  missing: '请先获取验证码',
  expired: '验证码已过期，请重新发送',
  locked: '验证码错误次数过多，请重新发送',
  mismatch: '验证码错误',
}

const AuthVerifyRequestSchema = {
  tags: ['Auth'],
  summary: 'Verify OTP and get token',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            email: z.string().email(),
            otp: z.string().regex(/^\d{6}$/),
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
    const email = normalizeAuthEmail(data.body.email)
    const { otp } = data.body

    const id = c.env.USER_STORAGE.idFromName(email)
    const stub = c.env.USER_STORAGE.get(id)

    const result = await stub.verifyOtp(otp)

    if (result.valid === false) {
      return c.json(
        {
          success: false,
          error: OTP_ERROR_MESSAGES[result.reason],
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
