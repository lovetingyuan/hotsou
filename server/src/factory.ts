import { createFactory } from 'hono/factory'

import type { AppEnv } from './types'

export const factory = createFactory<{ Bindings: AppEnv }>()
