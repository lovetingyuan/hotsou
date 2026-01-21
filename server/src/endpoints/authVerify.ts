import { OpenAPIRoute, Str, Bool } from 'chanfana'
import { z } from 'zod'
import { AppContext } from '../types'

const AuthVerifySchema = {
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
  schema = AuthVerifySchema

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof AuthVerifySchema>()
    const { email, otp } = data.body

    const id = c.env.USER_STORAGE.idFromName(email)
    const stub = c.env.USER_STORAGE.get(id)

    const isValid = await stub.verifyOtp(otp)

    if (!isValid) {
      return c.json(
        {
          success: false,
          error: 'Invalid or expired OTP',
        },
        400,
      )
    }

    // Generate Token
    const token = crypto.randomUUID()

    await stub.saveToken(token, email)

    return {
      success: true,
      token: token,
    }
  }
}
