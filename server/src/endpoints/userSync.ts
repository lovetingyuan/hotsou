import { Bool, OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { AppContext, SyncOperationSchema } from '../types'

export const UserSyncSchema = {
  tags: ['Users'],
  summary: 'Sync user data (get, set, delete)',
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
          schema: SyncOperationSchema,
        },
      },
    },
  },
  responses: {
    '200': {
      description: 'Sync successful',
      content: {
        'application/json': {
          schema: z.object({
            success: Bool(),
            result: z.any(),
          }),
        },
      },
    },
    '400': {
      description: 'Bad Request',
      content: {
        'application/json': {
          schema: z.object({
            success: Bool(),
            error: z.string(),
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
            error: z.string(),
          }),
        },
      },
    },
  },
}

export class UserSync extends OpenAPIRoute {
  schema = UserSyncSchema as any

  async handle(c: AppContext) {
    const data = await this.getValidatedData<any>()

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
    const syncOps = data.body

    const token = authorization.replace(/^Bearer\s+/i, '')

    const id = c.env.USER_STORAGE.idFromName(userEmail)
    const stub = c.env.USER_STORAGE.get(id)

    const verifyResult = await stub.verifyToken(token)

    if (!verifyResult.valid) {
      return c.json(
        {
          success: false,
          error: 'Unauthorized: Invalid token',
        },
        401,
      )
    }

    try {
      const result = await stub.syncData(syncOps)
      // @ts-ignore
      return c.json({
        success: true,
        result,
      })
    } catch (e: any) {
      return c.json(
        {
          success: false,
          error: e.message || 'Sync failed',
        },
        400,
      )
    }
  }
}
