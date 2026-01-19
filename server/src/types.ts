import { DateTime, Str } from 'chanfana'
import type { Context } from 'hono'
import { z } from 'zod'

export type AppContext = Context<{ Bindings: Env }>

export const TaskSchema = z.object({
  name: Str({ example: 'lorem' }),
  slug: Str(),
  description: Str({ required: false }),
  completed: z.boolean().default(false),
  due_date: DateTime(),
})

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

export const UserDataSchema = z.object({
  $tabsList: z.array(TabItemSchema),
  $enableTextSelect: z.boolean(),
})

export type UserData = z.infer<typeof UserDataSchema>
