import { Bool, OpenAPIRoute, Str } from 'chanfana'
import { z } from 'zod'
import { AppContext, UserDataSchema } from '../types'

const UserApplicationDataUpdateSchema = {
  tags: ['Users'],
  summary: 'Update user application data',
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
      description: 'Data updated successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: Bool(),
            result: UserDataSchema,
          }),
        },
      },
    },
    '404': {
      description: 'User data not found',
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

export class UserApplicationDataUpdate extends OpenAPIRoute {
  schema = UserApplicationDataUpdateSchema

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof UserApplicationDataUpdateSchema>()
    const { userEmail } = data.params
    const bodyData = data.body

    const id = c.env.USER_STORAGE.idFromName(userEmail)
    const stub = c.env.USER_STORAGE.get(id)

    try {
      await stub.updateData(userEmail, bodyData)
    } catch (e: any) {
      if (e.message.includes('User data not found')) {
        return c.json(
          {
            success: false,
            error: 'User data not found',
          },
          404,
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
