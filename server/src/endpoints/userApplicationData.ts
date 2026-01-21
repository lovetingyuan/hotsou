import { Bool, OpenAPIRoute, Str } from 'chanfana'
import { z } from 'zod'
import { AppContext, UserDataSchema } from '../types'

const UserApplicationDataSchema = {
  tags: ['Users'],
  summary: 'Get user application data',
  request: {
    params: z.object({
      userEmail: Str({ description: 'The unique user Email' }),
    }),
  },
  responses: {
    '200': {
      description: 'Returns the user application data',
      content: {
        'application/json': {
          schema: z.object({
            success: Bool(),
            result: UserDataSchema,
          }),
        },
      },
    },
  },
}

export class UserApplicationData extends OpenAPIRoute {
  schema = UserApplicationDataSchema

  async handle(c: AppContext) {
    console.log('UserApplicationData endpoint hit')
    const data = await this.getValidatedData<typeof UserApplicationDataSchema>()
    const { userEmail } = data.params
    console.log('Fetching data for userEmail:', userEmail)

    const id = c.env.USER_STORAGE.idFromName(userEmail)
    const stub = c.env.USER_STORAGE.get(id)
    const dataResult = await stub.getData(userEmail)

    return {
      success: true,
      result: dataResult || {
        $tabsList: [],
        $enableTextSelect: false,
      },
    }
  }
}
