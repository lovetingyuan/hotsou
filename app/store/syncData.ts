import { z } from 'zod'

import { normalizeTabsList, type TabItem } from '../constants/Tabs'

export type FavoriteItem = {
  title: string
  url: string
  created_at: number
}

export type SyncDataValueMap = {
  $tabsList: TabItem[]
  $enableTextSelect: boolean
  $favorList: FavoriteItem[]
  $fabPosition: 'left' | 'right'
}

export const SyncDataKeys = [
  '$tabsList',
  '$enableTextSelect',
  '$favorList',
  '$fabPosition',
] as const

export type SyncDataKey = (typeof SyncDataKeys)[number]

export type PartialSyncPayload = Partial<SyncDataValueMap>

export function isSyncDataKey(key: string): key is SyncDataKey {
  return SyncDataKeys.includes(key as SyncDataKey)
}

const FavoriteItemSchema = z.object({
  title: z.string().min(1),
  url: z.string().min(1),
  created_at: z.number().finite(),
})

const TabItemSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  url: z.string().min(1),
  show: z.boolean(),
  builtIn: z.boolean().optional(),
  icon: z.string().optional(),
})

const FabPositionSchema = z.enum(['left', 'right'])

function parseArrayItems<T>(value: unknown, schema: z.ZodType<T>): T[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.flatMap((item) => {
    const parsed = schema.safeParse(item)
    return parsed.success ? [parsed.data] : []
  })
}

function assignNormalizedValue<K extends SyncDataKey>(
  target: PartialSyncPayload,
  key: K,
  value: SyncDataValueMap[K],
) {
  target[key] = value
}

export function normalizeSyncValue<K extends SyncDataKey>(
  key: K,
  value: unknown,
): SyncDataValueMap[K] {
  switch (key) {
    case '$tabsList':
      return normalizeTabsList(parseArrayItems(value, TabItemSchema)) as SyncDataValueMap[K]
    case '$enableTextSelect':
      return (typeof value === 'boolean' ? value : false) as SyncDataValueMap[K]
    case '$favorList':
      return parseArrayItems(value, FavoriteItemSchema) as SyncDataValueMap[K]
    case '$fabPosition': {
      const parsed = FabPositionSchema.safeParse(value)
      return (parsed.success ? parsed.data : 'right') as SyncDataValueMap[K]
    }
    default: {
      const _exhaustive: never = key
      throw new Error(`Unknown sync key: ${_exhaustive}`)
    }
  }
}

export function normalizePartialSyncPayload(
  payload: Partial<Record<SyncDataKey, unknown>>,
): PartialSyncPayload {
  const normalizedPayload: PartialSyncPayload = {}

  for (const key of SyncDataKeys) {
    if (!Object.prototype.hasOwnProperty.call(payload, key)) {
      continue
    }

    const value = payload[key]
    if (value === undefined) {
      continue
    }

    assignNormalizedValue(normalizedPayload, key, normalizeSyncValue(key, value))
  }

  return normalizedPayload
}

export function getDefaultSyncPayload(): SyncDataValueMap {
  return {
    $tabsList: normalizeTabsList([]),
    $enableTextSelect: false,
    $favorList: [],
    $fabPosition: 'right',
  }
}

export function hasSyncValueChanged(before: unknown, after: unknown) {
  return JSON.stringify(before) !== JSON.stringify(after)
}
