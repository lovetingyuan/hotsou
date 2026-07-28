import { z } from 'zod'

export type AppEnv = Env

/**
 * {
    $tabsList: {
				name: string
				title: string
				url: string
				show: boolean
				builtIn?: boolean
				icon?: string
			}[],
			$enableTextSelect: boolean
		}
 */
const TabItemSchema = z.object({
  name: z.string(),
  title: z.string(),
  url: z.string(),
  show: z.boolean(),
  builtIn: z.boolean().optional(),
  icon: z.string().optional(),
})

export const UserDataSchema = z.record(z.string(), z.any())

export type UserDataType = z.infer<typeof UserDataSchema>

export const SyncOperationSchema = z.object({
  set: z.record(z.string(), z.unknown()).optional(),
  delete: z.array(z.string()).optional(),
  get: z.array(z.string()).optional(),
})

export type SyncOperation = z.infer<typeof SyncOperationSchema>

// ==================== Auth Schemas ====================

export const AuthEmailSchema = z.object({
  email: z.email(),
})

export const AuthOtpRequestSchema = z.object({
  email: z.email(),
})

export const AuthVerifyRequestSchema = z.object({
  email: z.email(),
  otp: z.string().regex(/^\d{6}$/),
})

export const AuthStatusRequestSchema = z.object({
  email: z.email(),
  token: z.uuid(),
})

export const AuthLogoutRequestSchema = z.object({
  email: z.email(),
  token: z.uuid(),
})
