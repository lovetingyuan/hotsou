import { useEffect, useRef } from 'react'

import { normalizeTabsList } from '@/constants/Tabs'
import {
  type AppContextValueType,
  getStoreMethods,
  getStoreState,
  subscribeStore,
  SyncDataKeys,
  useStore,
} from '@/store'
import { userApi } from '@/utils/api'
import { getAuthData } from '@/utils/secureStore'

type SyncKey = (typeof SyncDataKeys)[number]
type SyncPayload = Pick<AppContextValueType, SyncKey>
type PartialSyncPayload = Partial<SyncPayload>

export function DataSync() {
  const { isLogin } = useStore()
  const previousDataRef = useRef<PartialSyncPayload>({})
  const syncingRef = useRef(false)
  const isFirstLoginSync = useRef(true)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const normalizeSyncValue = <K extends SyncKey>(key: K, value: SyncPayload[K]): SyncPayload[K] => {
    if (key === '$tabsList') {
      return normalizeTabsList(value as AppContextValueType['$tabsList']) as SyncPayload[K]
    }

    return value
  }

  const assignSyncValue = <K extends SyncKey>(
    target: PartialSyncPayload,
    key: K,
    value: SyncPayload[K],
  ) => {
    if (key === '$tabsList') {
      target.$tabsList = value as AppContextValueType['$tabsList']
      return
    }

    if (key === '$enableTextSelect') {
      target.$enableTextSelect = value as AppContextValueType['$enableTextSelect']
      return
    }

    if (key === '$fabPosition') {
      target.$fabPosition = value as AppContextValueType['$fabPosition']
      return
    }

    target.$favorList = value as AppContextValueType['$favorList']
  }

  const setSyncedValue = <K extends SyncKey>(key: K, value: SyncPayload[K]) => {
    const methods = getStoreMethods()

    if (key === '$tabsList') {
      methods.set$tabsList(value as AppContextValueType['$tabsList'])
      return
    }

    if (key === '$enableTextSelect') {
      methods.set$enableTextSelect(value as AppContextValueType['$enableTextSelect'])
      return
    }

    if (key === '$fabPosition') {
      methods.set$fabPosition(value as AppContextValueType['$fabPosition'])
      return
    }

    methods.set$favorList(value as AppContextValueType['$favorList'])
  }

  const syncLocalTabsListIfNeeded = (tabsList: AppContextValueType['$tabsList']) => {
    const currentTabsList = getStoreState().$tabsList
    if (JSON.stringify(currentTabsList) !== JSON.stringify(tabsList)) {
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
          const remoteData = syncRes.result as PartialSyncPayload
          const hasRemoteData = Object.keys(remoteData).length > 0

          if (hasRemoteData) {
            const normalizedRemoteData: PartialSyncPayload = {}

            SyncDataKeys.forEach((key) => {
              const remoteValue = remoteData[key]
              if (remoteValue === undefined) {
                return
              }

              const normalizedValue = normalizeSyncValue(key, remoteValue)
              assignSyncValue(normalizedRemoteData, key, normalizedValue)
              setSyncedValue(key, normalizedValue)
            })

            previousDataRef.current = normalizedRemoteData
          } else {
            const state = getStoreState()
            const payload: PartialSyncPayload = {}

            SyncDataKeys.forEach((key) => {
              assignSyncValue(payload, key, normalizeSyncValue(key, state[key]))
            })

            if (
              !payload.$tabsList ||
              !payload.$favorList ||
              payload.$enableTextSelect === undefined
            ) {
              return
            }

            syncLocalTabsListIfNeeded(payload.$tabsList)

            await userApi.sync(email, token, {
              set: payload,
            })
            previousDataRef.current = { ...payload }
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

        if (JSON.stringify(currentVal) !== JSON.stringify(prevVal)) {
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
        await userApi.sync(email, token, {
          set: changes,
        })
        previousDataRef.current = { ...previousDataRef.current, ...changes }
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

        if (JSON.stringify(currentVal) !== JSON.stringify(prevVal)) {
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
