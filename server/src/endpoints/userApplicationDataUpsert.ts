import { Bool, OpenAPIRoute, Str } from 'chanfana'
import { z } from 'zod'
import { AppContext, UserData } from '../types'

const UserApplicationDataUpsertSchema = {
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

export class UserApplicationDataUpsert extends OpenAPIRoute {
  schema = UserApplicationDataUpsertSchema

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof UserApplicationDataUpsertSchema>()
    const { userId } = data.params
    const bodyData = data.body

    const id = c.env.USER_STORAGE.idFromName('global')
    const stub = c.env.USER_STORAGE.get(id) //as unknown as UserStorageStub
    await stub.saveData(userId, bodyData)

    return {
      success: true,
      result: bodyData,
    }
  }
}
