import { Bool, OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { AppContext, UserDataSchema } from '../types'

const UserApplicationDataUpdateSchema = {
  tags: ['Users'],
  summary: 'Update user application data',
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
            error: z.string(),
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
      await stub.updateData(bodyData)
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
