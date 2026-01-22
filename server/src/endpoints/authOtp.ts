import { Bool, Int, OpenAPIRoute, Str } from 'chanfana'
import { z } from 'zod'
import { sendOtpEmail } from '../services/email'
import { AppContext } from '../types'

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
    const { email } = data.body

    const id = c.env.USER_STORAGE.idFromName(email)
    const stub = c.env.USER_STORAGE.get(id)

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
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // 保存验证码
    await stub.saveOtp(otp)

    // 发送邮件
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

    console.log(`[AUTH] OTP sent to ${email}`)

    return {
      success: true,
      message: '验证码已发送',
    }
  }
}
