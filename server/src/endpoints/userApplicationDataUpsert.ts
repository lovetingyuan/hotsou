import { Bool, OpenAPIRoute, Str } from 'chanfana'
import { z } from 'zod'
import { AppContext, UserData } from '../types'

export class UserApplicationDataUpsert extends OpenAPIRoute {
  schema = {
    tags: ['Users'],
    summary: 'Create or Update user application data',
    request: {
      params: z.object({
        userId: Str({ description: 'The unique user ID' }),
      }),
      body: {
        content: {
          'application/json': {
            schema: UserData,
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Data saved successfully',
        content: {
          'application/json': {
            schema: z.object({
              success: Bool(),
              result: UserData,
            }),
          },
        },
      },
    },
  }

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>()
    const { userId } = data.params
    const bodyData = data.body

    await c.env.USER_DATA_KV.put(userId, JSON.stringify(bodyData))

    return {
      success: true,
      result: bodyData,
    }
  }
}
