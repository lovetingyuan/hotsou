import { Bool, OpenAPIRoute, Str } from 'chanfana'
import { z } from 'zod'
import { AppContext, UserDataSchema } from '../types'

const UserApplicationDataCreateSchema = {
  tags: ['Users'],
  summary: 'Create user application data',
  request: {
    params: z.object({
      userEmail: Str({ description: 'The unique user Email' }),
    }),
    body: {
      content: {
        'application/json': {
          schema: UserDataSchema,
        },
      },
    },
  },
  responses: {
    '200': {
      description: 'Data created successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: Bool(),
            result: UserDataSchema,
          }),
        },
      },
    },
    '409': {
      description: 'User data already exists',
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

export class UserApplicationDataCreate extends OpenAPIRoute {
  schema = UserApplicationDataCreateSchema

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof UserApplicationDataCreateSchema>()
    const { userEmail } = data.params
    const bodyData = data.body

    const id = c.env.USER_STORAGE.idFromName(userEmail)
    const stub = c.env.USER_STORAGE.get(id)

    try {
      await stub.createData(userEmail, bodyData)
    } catch (e: any) {
      if (e.message.includes('User data already exists')) {
        return c.json(
          {
            success: false,
            error: 'User data already exists',
          },
          409,
        )
      }
      throw e
    }

    return {
      success: true,
      result: bodyData,
    }
  }
}
