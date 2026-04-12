import { useEffect, useRef } from 'react'

import { getStoreMethods, getStoreState, subscribeStore, useStore } from '@/store'
import {
  hasSyncValueChanged,
  normalizePartialSyncPayload,
  normalizeSyncValue,
  type PartialSyncPayload,
  SyncDataKeys,
  type SyncDataKey,
  type SyncDataValueMap,
} from '@/store/syncData'
import { userApi } from '@/utils/api'
import { getAuthData } from '@/utils/secureStore'

type SyncKey = SyncDataKey
type SyncPayload = SyncDataValueMap

export function DataSync() {
  const { isLogin } = useStore()
  const previousDataRef = useRef<PartialSyncPayload>({})
  const syncingRef = useRef(false)
  const isFirstLoginSync = useRef(true)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const assignSyncValue = <K extends SyncKey>(
    target: PartialSyncPayload,
    key: K,
    value: SyncPayload[K],
  ) => {
    ;(target as any)[key] = value
  }

  const setSyncedValue = <K extends SyncKey>(key: K, value: SyncPayload[K]) => {
    const methods = getStoreMethods()
    const setKey = `set${key}` as keyof typeof methods
    ;(methods[setKey] as (v: SyncPayload[K]) => void)(value)
  }

  const syncLocalTabsListIfNeeded = (tabsList: SyncPayload['$tabsList']) => {
    const currentTabsList = getStoreState().$tabsList
    if (hasSyncValueChanged(currentTabsList, tabsList)) {
      getStoreMethods().set$tabsList(tabsList)
    }
  }

  useEffect(() => {
    if (isLogin) {
      isFirstLoginSync.current = true
      return
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
  }, [isLogin])

  useEffect(() => {
    if (!isLogin) {
      return
    }

    const performInitialSync = async () => {
      if (!isLogin || syncingRef.current) {
        return
      }

      const { email, token } = await getAuthData()
      if (!email || !token) {
        return
      }

      syncingRef.current = true
      try {
        const syncRes = await userApi.sync(email, token, {
          get: SyncDataKeys as unknown as string[],
        })

        if (syncRes.success) {
          const remoteData = syncRes.result as Partial<Record<SyncKey, unknown>>
          const hasRemoteData = Object.keys(remoteData).length > 0

          if (hasRemoteData) {
            const normalizedRemoteData = normalizePartialSyncPayload(remoteData)
            const repairedRemoteData: PartialSyncPayload = {}

            SyncDataKeys.forEach((key) => {
              const remoteValue = remoteData[key]
              if (remoteValue === undefined) {
                return
              }

              const normalizedValue = normalizedRemoteData[key]
              if (normalizedValue === undefined) {
                return
              }

              assignSyncValue(normalizedRemoteData, key, normalizedValue)
              setSyncedValue(key, normalizedValue)

              if (hasSyncValueChanged(remoteValue, normalizedValue)) {
                assignSyncValue(repairedRemoteData, key, normalizedValue)
              }
            })

            previousDataRef.current = normalizedRemoteData

            if (Object.keys(repairedRemoteData).length > 0) {
              await userApi.sync(email, token, {
                set: repairedRemoteData,
              })
            }
          } else {
            const state = getStoreState()
            const payload: PartialSyncPayload = {}

            SyncDataKeys.forEach((key) => {
              assignSyncValue(payload, key, normalizeSyncValue(key, state[key]))
            })

            if (SyncDataKeys.some((key) => payload[key] === undefined)) {
              return
            }

            const normalizedPayload = normalizePartialSyncPayload(payload)

            if (normalizedPayload.$tabsList) {
              syncLocalTabsListIfNeeded(normalizedPayload.$tabsList)
            }

            await userApi.sync(email, token, {
              set: normalizedPayload,
            })
            previousDataRef.current = { ...normalizedPayload }
          }
        }
      } catch (error) {
        console.error('Initial sync failed', error)
      } finally {
        syncingRef.current = false
        isFirstLoginSync.current = false
      }
    }

    const performUpdateSync = async () => {
      if (!isLogin || isFirstLoginSync.current) {
        return
      }

      const changes: PartialSyncPayload = {}
      let hasChanges = false
      const state = getStoreState()

      SyncDataKeys.forEach((key) => {
        const currentVal = normalizeSyncValue(key, state[key])
        const prevVal = previousDataRef.current[key]

        if (hasSyncValueChanged(prevVal, currentVal)) {
          assignSyncValue(changes, key, currentVal)
          hasChanges = true
        }
      })

      if (!hasChanges || syncingRef.current) {
        return
      }

      if (changes.$tabsList) {
        syncLocalTabsListIfNeeded(changes.$tabsList)
      }

      syncingRef.current = true

      const { email, token } = await getAuthData()
      if (!email || !token) {
        syncingRef.current = false
        return
      }

      try {
        const normalizedChanges = normalizePartialSyncPayload(changes)
        await userApi.sync(email, token, {
          set: normalizedChanges,
        })
        previousDataRef.current = { ...previousDataRef.current, ...normalizedChanges }
      } catch (error) {
        console.error('Update sync failed', error)
      } finally {
        syncingRef.current = false
      }
    }

    performInitialSync()

    const unsubscribe = subscribeStore(() => {
      if (isFirstLoginSync.current) {
        return
      }

      const state = getStoreState()
      let hasChanges = false
      SyncDataKeys.forEach((key) => {
        const currentVal = normalizeSyncValue(key, state[key])
        const prevVal = previousDataRef.current[key]

        if (hasSyncValueChanged(prevVal, currentVal)) {
          hasChanges = true
        }
      })

      if (hasChanges) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }
        debounceTimerRef.current = setTimeout(() => {
          performUpdateSync()
        }, 2000)
      }
    })

    return () => {
      unsubscribe()
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [isLogin])

  return null
}
