import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { generateNumericOtp } from '../authSecurity'
import { normalizeAuthEmail } from '../authEmail'
import { factory } from '../factory'
import { sendOtpEmail } from '../services/email'
import { validationHook } from '../validation'

const GLOBAL_OTP_RATE_LIMIT_ID = 'auth_otp_global'
const OTP_GLOBAL_LIMIT = 120
const OTP_GLOBAL_WINDOW_MS = 60 * 1000

const AuthOtpBodySchema = z.object({
  email: z.email(),
})

export const AuthOtp = factory.createHandlers(
  zValidator('json', AuthOtpBodySchema, validationHook),
  async (c) => {
    const { email: inputEmail } = c.req.valid('json')
    const email = normalizeAuthEmail(inputEmail)

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

    return c.json({
      success: true,
      message: '验证码已发送',
    })
  },
)
