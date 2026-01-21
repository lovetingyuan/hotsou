import { OpenAPIRoute, Str, Bool } from 'chanfana'
import { z } from 'zod'
import { AppContext } from '../types'

const AuthOtpSchema = {
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
  },
}

export class AuthOtp extends OpenAPIRoute {
  schema = AuthOtpSchema

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof AuthOtpSchema>()
    const { email } = data.body

    const id = c.env.USER_STORAGE.idFromName(email)
    const stub = c.env.USER_STORAGE.get(id)

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    await stub.saveOtp(otp)

    // Send email (Mock for now)
    // In a real implementation, you would use a binding like SendGrid or Resend here.
    console.log(`[AUTH] Sending OTP ${otp} to ${email}`)

    return {
      success: true,
      message: 'OTP sent',
    }
  }
}
