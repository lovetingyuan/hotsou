import AsyncStorage from '@react-native-async-storage/async-storage'
import { createStore } from 'react-atomic-store'
import { ToastAndroid } from 'react-native'

import { normalizeTabsList, type TabItem, TabsList } from '@/constants/Tabs'

const getAppValue = () => {
  return {
    initialed: false,
    reloadAllTab: 0,
    reloadTab: ['', false] as [string, boolean],
    showPageInfo: [''] as [string],
    shareInfo: [''] as [string],
    clickTab: [''] as [string],
    clearSelection: 0,
    $favorList: [] as {
      title: string
      url: string
      created_at: number
    }[],
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
  return Promise.all(
    storedKeys.map(async (k) => {
      const key = k as StoredKeys
      const setKey = `set${key}` as const
      const data = await AsyncStorage.getItem(key)
      if (!data) {
        return
      }

      if (key === '$tabsList') {
        const list = normalizeTabsList(JSON.parse(data) as AppContextValueType['$tabsList'])
        methods.set$tabsList(list)
        return
      }

      methods[setKey](JSON.parse(data))
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

export const SyncDataKeys: StoredKeys[] = ['$tabsList', '$enableTextSelect', '$favorList', '$fabPosition'] as const
