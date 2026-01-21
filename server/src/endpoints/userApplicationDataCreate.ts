import { Bool, OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { AppContext, UserDataSchema } from '../types'

const UserApplicationDataCreateSchema = {
  tags: ['Users'],
  summary: 'Create user application data',
  request: {
    params: z.object({
      userEmail: z.string().email(),
    }),
    headers: z.object({
      authorization: z.string().optional(),
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
            error: z.string(),
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
    const bodyData = data.body

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

    try {
      await stub.createData(bodyData)
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
