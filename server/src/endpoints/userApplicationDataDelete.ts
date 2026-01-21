import { Bool, OpenAPIRoute, Str } from 'chanfana'
import { z } from 'zod'
import { AppContext } from '../types'

export class UserApplicationDataDelete extends OpenAPIRoute {
  schema = {
    tags: ['Users'],
    summary: 'Delete user application data',
    request: {
      params: z.object({
        userEmail: Str({ description: 'The unique user Email' }),
      }),
    },
    responses: {
      '200': {
        description: 'Data deleted successfully',
        content: {
          'application/json': {
            schema: z.object({
              success: Bool(),
            }),
          },
        },
      },
    },
  }

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>()
    const { userEmail } = data.params

    const id = c.env.USER_STORAGE.idFromName(userEmail)
    const stub = c.env.USER_STORAGE.get(id)
    await stub.deleteData()

    return {
      success: true,
    }
  }
}
