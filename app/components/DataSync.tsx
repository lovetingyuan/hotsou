import React, { useEffect, useRef } from 'react'
import { ToastAndroid, Platform } from 'react-native'

import { userApi } from '@/utils/api'
import { useStore, getStoreState, AppContextValueType, StoredKeys } from '@/store'

export function DataSync() {
  const { $userEmail, $authToken, $tabsList, $enableTextSelect } = useStore()
  const previousDataRef = useRef<{
    $tabsList: AppContextValueType['$tabsList']
    $enableTextSelect: AppContextValueType['$enableTextSelect']
  }>({
    $tabsList,
    $enableTextSelect,
  })
  const syncingRef = useRef(false)

  useEffect(() => {
    const showToast = (message: string) => {
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT)
      }
    }

    const syncToServer = async (data: AppContextValueType) => {
      if (!$userEmail || !$authToken || syncingRef.current) {
        return
      }

      syncingRef.current = true

      try {
        const syncData = {
          $tabsList: data.$tabsList,
          $enableTextSelect: data.$enableTextSelect,
        }

        const checkData = await userApi.getData($userEmail, $authToken)

        if (checkData.success) {
          if (checkData.result) {
            await userApi.updateData($userEmail, $authToken, syncData)
          } else {
            await userApi.createData($userEmail, $authToken, syncData)
          }
          showToast('数据已同步到服务器')
        }
      } catch (error: any) {
        console.error('Sync failed:', error)
        if (Platform.OS === 'android') {
          ToastAndroid.show('数据同步失败', ToastAndroid.SHORT)
        }
      } finally {
        syncingRef.current = false
      }
    }

    const tabsListChanged =
      JSON.stringify(previousDataRef.current.$tabsList) !== JSON.stringify($tabsList)
    const enableTextSelectChanged = previousDataRef.current.$enableTextSelect !== $enableTextSelect

    if (tabsListChanged || enableTextSelectChanged) {
      const state = getStoreState() as AppContextValueType
      syncToServer(state)
      previousDataRef.current = {
        $tabsList,
        $enableTextSelect,
      }
    }
  }, [$tabsList, $enableTextSelect, $userEmail, $authToken])

  return null
}
