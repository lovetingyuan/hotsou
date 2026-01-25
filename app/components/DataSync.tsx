import React, { useEffect, useRef } from 'react'
import { Platform, ToastAndroid } from 'react-native'

import {
  AppContextValueType,
  getStoreMethods,
  getStoreState,
  subscribeStore,
  SyncDataKeys,
  useStore,
} from '@/store'
import { userApi } from '@/utils/api'
import { getAuthData } from '@/utils/secureStore'

export function DataSync() {
  const { isLogin } = useStore()
  const previousDataRef = useRef<{
    [key: string]: any
  }>({})
  const syncingRef = useRef(false)
  const isFirstLoginSync = useRef(true)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Reset flags on login status change
    if (isLogin) {
      isFirstLoginSync.current = true
    } else {
      // Clean up if logged out
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [isLogin])

  useEffect(() => {
    if (!isLogin) return

    const performInitialSync = async () => {
      if (!isLogin || syncingRef.current) return

      const { email, token } = await getAuthData()
      if (!email || !token) return

      syncingRef.current = true
      try {
        // 1. Get remote data
        const syncRes = await userApi.sync(email, token, {
          get: SyncDataKeys as unknown as string[],
        })

        if (syncRes.success) {
          const remoteData = syncRes.result
          const hasRemoteData = Object.keys(remoteData).length > 0

          if (hasRemoteData) {
            // Server Wins: Update local store with remote data
            const methods = getStoreMethods()
            // Update reference to avoid triggering update sync
            previousDataRef.current = { ...remoteData }

            // Iterate over allowed keys to safely update store
            SyncDataKeys.forEach((key: any) => {
              if (remoteData[key] !== undefined) {
                // Determine the setter name (e.g., set$tabsList)
                // Since methods are dynamic, we cast or use specific knowledge
                const methodKey = `set${key}` as keyof typeof methods
                if (methods[methodKey]) {
                  ;(methods[methodKey] as Function)(remoteData[key])
                }
              }
            })
            // showToast('数据已从服务器恢复')
          } else {
            // Client Wins: Upload local data to server
            // Construct payload from current store state
            const state = getStoreState() as any
            const payload: Record<string, any> = {}
            SyncDataKeys.forEach((key: any) => {
              payload[key] = state[key]
            })

            await userApi.sync(email, token, {
              set: payload,
            })
            previousDataRef.current = { ...payload }
            // showToast('本地数据已同步到服务器')
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
      if (!isLogin || isFirstLoginSync.current) return

      const changes: Record<string, any> = {}
      let hasChanges = false
      const state = getStoreState() as any

      SyncDataKeys.forEach((key: any) => {
        const currentVal = state[key]
        const prevVal = previousDataRef.current[key]

        // Simple JSON stringify comparison
        if (JSON.stringify(currentVal) !== JSON.stringify(prevVal)) {
          changes[key] = currentVal
          hasChanges = true
        }
      })

      if (!hasChanges) return

      if (syncingRef.current) return
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
        // Update previous ref to reflect what's now on server
        previousDataRef.current = { ...previousDataRef.current, ...changes }
        // showToast('同步成功') // Too noisy for auto-sync
      } catch (error) {
        console.error('Update sync failed', error)
      } finally {
        syncingRef.current = false
      }
    }

    // 1. Run Initial Sync
    performInitialSync()

    // 2. Subscribe to changes
    const unsubscribe = subscribeStore((newState) => {
      if (isFirstLoginSync.current) return

      // Check if any SyncDataKeys changed
      let hasChanges = false
      SyncDataKeys.forEach((key: any) => {
        // @ts-ignore
        const currentVal = newState[key]
        const prevVal = previousDataRef.current[key]

        if (JSON.stringify(currentVal) !== JSON.stringify(prevVal)) {
          hasChanges = true
        }
      })

      if (hasChanges) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = setTimeout(() => {
          performUpdateSync()
        }, 2000)
      }
    })

    return () => {
      unsubscribe()
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [isLogin])

  return null
}
