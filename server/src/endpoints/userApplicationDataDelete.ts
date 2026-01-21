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
      headers: z.object({
        authorization: z.string().optional(),
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

    if (!data || !data.headers || !data.headers.authorization) {
      return c.json(
        {
          success: false,
          error: 'Unauthorized: Authorization header is required',
        },
        401,
      )
    }

    const { userEmail } = data.params
    const { authorization } = data.headers

    const token = authorization.replace(/^Bearer\s+/i, '')

    const id = c.env.USER_STORAGE.idFromName(userEmail)
    const stub = c.env.USER_STORAGE.get(id)

    const isAuthorized = await stub.verifyToken(token)

    if (!isAuthorized) {
      return c.json(
        {
          success: false,
          error: 'Unauthorized: Invalid token',
        },
        401,
      )
    }
    await stub.deleteData()

    return {
      success: true,
    }
  }
}
