import AsyncStorage from '@react-native-async-storage/async-storage'
import { createStore } from 'react-atomic-store'
import { ToastAndroid } from 'react-native'

import { normalizeTabsList, type TabItem, TabsList } from '@/constants/Tabs'
import {
  isSyncDataKey,
  normalizeSyncValue,
  type FavoriteItem,
  SyncDataKeys,
} from '@/store/syncData'

const getAppValue = () => {
  return {
    initialed: false,
    reloadAllTab: 0,
    reloadTab: ['', false] as [string, boolean],
    showPageInfo: [''] as [string],
    shareInfo: [''] as [string],
    clickTab: [''] as [string],
    clearSelection: 0,
    $favorList: [] as FavoriteItem[],
    $tabsList: normalizeTabsList(TabsList as TabItem[]),
    $lastPromptedAppVersion: '',
    $lastPromptedAppVersionTime: 0,
    $enableTextSelect: false,
    $fabPosition: 'right' as 'left' | 'right',
    douyinHotId: '',
    douyinVideoId: '',
    activeTab: '',
    isLogin: false,
  }
}

const initValue = getAppValue()

export const { useStore, getStoreMethods, subscribeStore, getStoreState } = createStore(initValue)

export type AppContextValueType = ReturnType<typeof getAppValue>

export type StoredKeys<K = keyof AppContextValueType> = K extends `$${string}` ? K : never

const storedKeys = Object.keys(initValue).filter((k) => k.startsWith('$')) as StoredKeys[]

export const fulfillStoreKeys = () => {
  const methods = getStoreMethods()
  const setStoredValue = <K extends StoredKeys>(key: K, value: AppContextValueType[K]) => {
    const setKey = `set${key}` as const
    const setValue = methods[setKey] as (nextValue: AppContextValueType[K]) => void
    setValue(value)
  }

  return Promise.all(
    storedKeys.map(async (k) => {
      const key = k as StoredKeys
      const data = await AsyncStorage.getItem(key)
      if (!data) {
        return
      }

      let parsedValue: unknown
      try {
        parsedValue = JSON.parse(data)
      } catch (error) {
        console.warn(`[store] failed to parse persisted value for ${key}`, error)
      }

      const normalizedValue = isSyncDataKey(key)
        ? normalizeSyncValue(key, parsedValue)
        : parsedValue
      setStoredValue(key, normalizedValue as AppContextValueType[typeof key])

      const normalizedSerialized = JSON.stringify(normalizedValue)
      if (normalizedSerialized !== data) {
        await AsyncStorage.setItem(key, normalizedSerialized)
      }
    }),
  )
    .then(() => {
      methods.setInitialed(true)
    })
    .catch((err) => {
      ToastAndroid.show('抱歉，数据初始化失败', ToastAndroid.SHORT)
      throw err
    })
}

export { SyncDataKeys } from '@/store/syncData'
