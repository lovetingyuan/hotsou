import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { normalizeAuthEmail } from '../authEmail'
import { factory } from '../factory'
import { validationHook } from '../validation'
import type { OtpVerificationFailureReason } from '../authSecurity'

const OTP_ERROR_MESSAGES: Record<OtpVerificationFailureReason, string> = {
  missing: '请先获取验证码',
  expired: '验证码已过期，请重新发送',
  locked: '验证码错误次数过多，请重新发送',
  mismatch: '验证码错误',
}

const AuthVerifyBodySchema = z.object({
  email: z.email(),
  otp: z.string().regex(/^\d{6}$/),
})

export const AuthVerify = factory.createHandlers(
  zValidator('json', AuthVerifyBodySchema, validationHook),
  async (c) => {
    const { email: inputEmail, otp } = c.req.valid('json')
    const email = normalizeAuthEmail(inputEmail)

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

    return c.json({
      success: true,
      token,
      isNewUser,
    })
  },
)
