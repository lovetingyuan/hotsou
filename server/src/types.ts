import { DateTime, Str } from 'chanfana'
import type { Context } from 'hono'
import { z } from 'zod'

export type AppContext = Context<{ Bindings: Env }>

export const Task = z.object({
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
export const UserData = z.object({
  $tabsList: z.array(
    z.object({
      name: z.string(),
      title: z.string(),
      url: z.string(),
      show: z.boolean(),
      builtIn: z.boolean().optional(),
      icon: z.string().optional(),
    })
  ),
  $enableTextSelect: z.boolean(),
})
