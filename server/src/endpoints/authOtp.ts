import { Bool, Int, OpenAPIRoute, Str } from 'chanfana'
import { z } from 'zod'
import { generateNumericOtp } from '../authSecurity'
import { normalizeAuthEmail } from '../authEmail'
import { sendOtpEmail } from '../services/email'
import { AppContext } from '../types'

const GLOBAL_OTP_RATE_LIMIT_ID = 'auth_otp_global'
const OTP_GLOBAL_LIMIT = 120
const OTP_GLOBAL_WINDOW_MS = 60 * 1000

const AuthOtpRequestSchema = {
  tags: ['Auth'],
  summary: 'Request OTP for email authentication',
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
      description: 'OTP sent successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: Bool(),
            message: Str(),
          }),
        },
      },
    },
    '429': {
      description: 'Rate limit exceeded',
      content: {
        'application/json': {
          schema: z.object({
            success: Bool(),
            error: Str(),
            waitSeconds: Int(),
          }),
        },
      },
    },
    '500': {
      description: 'Failed to send email',
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

export class AuthOtp extends OpenAPIRoute {
  schema = AuthOtpRequestSchema

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof AuthOtpRequestSchema>()
    const email = normalizeAuthEmail(data.body.email)

    const id = c.env.USER_STORAGE.idFromName(email)
    const stub = c.env.USER_STORAGE.get(id)

    const globalRateLimitId = c.env.USER_STORAGE.idFromName(GLOBAL_OTP_RATE_LIMIT_ID)
    const globalRateLimitStub = c.env.USER_STORAGE.get(globalRateLimitId)
    const globalRateLimit = await globalRateLimitStub.consumeRateLimit(
      'otp_global',
      OTP_GLOBAL_LIMIT,
      OTP_GLOBAL_WINDOW_MS,
    )
    if (!globalRateLimit.allowed) {
      return c.json(
        {
          success: false,
          error: `请求过于频繁，请等待 ${globalRateLimit.waitSeconds} 秒后再试`,
          waitSeconds: globalRateLimit.waitSeconds,
        },
        429,
      )
    }

    // 检查是否可以发送验证码（60秒冷却）
    const canSendResult = await stub.canSendOtp()
    if (!canSendResult.canSend) {
      return c.json(
        {
          success: false,
          error: `请等待 ${canSendResult.waitSeconds} 秒后再试`,
          waitSeconds: canSendResult.waitSeconds,
        },
        429,
      )
    }

    // 生成6位数字验证码
    const otp = generateNumericOtp()

    // 先发邮件，成功后再保存验证码
    const emailResult = await sendOtpEmail(c.env.RESEND_API_KEY, email, otp)

    if (!emailResult.success) {
      console.error(`[AUTH] Failed to send OTP to ${email}:`, emailResult.error)
      return c.json(
        {
          success: false,
          error: '发送验证码失败，请稍后重试',
        },
        500,
      )
    }

    // 邮件发送成功后保存验证码
    await stub.saveOtp(otp)

    console.log(`[AUTH] OTP sent to ${email}`)

    return {
      success: true,
      message: '验证码已发送',
    }
  }
}
