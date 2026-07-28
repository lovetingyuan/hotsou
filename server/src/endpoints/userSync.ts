import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { BearerAuthorizationHeaderSchema, parseBearerToken } from '../authSecurity'
import { factory } from '../factory'
import { type SyncOperation, SyncOperationSchema } from '../types'
import { validationHook } from '../validation'

const UserSyncHeaderSchema = z.object({
  authorization: BearerAuthorizationHeaderSchema,
})

export const UserSyncBodySchema = SyncOperationSchema.extend({
  email: z.email(),
})

export const UserSync = factory.createHandlers(
  zValidator('header', UserSyncHeaderSchema, validationHook),
  zValidator('json', UserSyncBodySchema, validationHook),
  async (c) => {
    const { authorization } = c.req.valid('header')
    const { email, set, delete: deleteKeys, get } = c.req.valid('json')

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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '同步失败'
      return c.json(
        {
          success: false,
          error: message,
        },
        400,
      )
    }
  },
)
