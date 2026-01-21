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
    headers: z.object({
      authorization: z.string().optional(),
    }),
  },
  responses: {
    '200': {
      description: 'Returns the user application data',
      content: {
        'application/json': {
          schema: z.object({
            success: Bool(),
            result: UserDataSchema.nullable(),
          }),
        },
      },
    },
    '401': {
      description: 'Unauthorized',
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

export class UserApplicationData extends OpenAPIRoute {
  schema = UserApplicationDataSchema

  async handle(c: AppContext) {
    console.log('UserApplicationData endpoint hit')
    const data = await this.getValidatedData<typeof UserApplicationDataSchema>().catch((err) => {
      console.log(999, err)
    })

    if (!data || !data.params || !data.params.userEmail) {
      return c.json(
        {
          success: false,
          error: 'Invalid request: userEmail is required',
        },
        400,
      )
    }

    const { userEmail } = data.params
    const { authorization } = data.headers

    if (!authorization) {
      return c.json(
        {
          success: false,
          error: 'Unauthorized: Authorization header is required',
        },
        401,
      )
    }

    console.log('UserApplicationData endpoint hit222')

    // Extract token
    const token = authorization.replace(/^Bearer\s+/i, '')

    console.log('Fetching data for userEmail:', userEmail)

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

    const dataResult = await stub.getData()

    return {
      success: true,
      result: dataResult,
    }
  }
}
