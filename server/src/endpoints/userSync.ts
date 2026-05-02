import { Bool, OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { BearerAuthorizationHeaderSchema, parseBearerToken } from '../authSecurity'
import { AppContext, type SyncOperation, SyncOperationSchema } from '../types'

export const UserSyncSchema = {
  tags: ['Users'],
  summary: 'Sync user data (get, set, delete)',
  request: {
    headers: z.object({
      authorization: BearerAuthorizationHeaderSchema,
    }),
    body: {
      content: {
        'application/json': {
          schema: SyncOperationSchema.extend({
            email: z.string().email(),
          }),
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
  schema = UserSyncSchema

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof UserSyncSchema>()

    if (!data || !data.headers || !data.headers.authorization) {
      return c.json(
        {
          success: false,
          error: '登录已失效，请重新登录',
        },
        401,
      )
    }

    const { authorization } = data.headers
    const { email, set, delete: deleteKeys, get } = data.body

    if (!email) {
      return c.json(
        {
          success: false,
          error: '邮箱不能为空',
        },
        400,
      )
    }

    const syncOps: SyncOperation = {
      set,
      delete: deleteKeys,
      get,
    }

    const token = parseBearerToken(authorization)

    if (!token) {
      return c.json(
        {
          success: false,
          error: '登录已失效，请重新登录',
        },
        401,
      )
    }

    const id = c.env.USER_STORAGE.idFromName(email)
    const stub = c.env.USER_STORAGE.get(id)

    const verifyResult = await stub.verifyToken(token)

    if (!verifyResult.valid) {
      return c.json(
        {
          success: false,
          error: '登录已失效，请重新登录',
        },
        401,
      )
    }

    try {
      const result: unknown = await stub.syncData(syncOps)
      return c.json({ success: true, result }, 200)
    } catch (e: any) {
      return c.json(
        {
          success: false,
          error: e.message || '同步失败',
        },
        400,
      )
    }
  }
}
