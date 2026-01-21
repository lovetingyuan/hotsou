import { OpenAPIRoute, Bool } from 'chanfana'
import { z } from 'zod'
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
            registered: z.boolean(),
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
    const { email } = data.body

    const id = c.env.USER_STORAGE.idFromName(email)
    const stub = c.env.USER_STORAGE.get(id)

    const isRegistered = await stub.isRegistered()

    return {
      success: true,
      registered: isRegistered,
    }
  }
}
