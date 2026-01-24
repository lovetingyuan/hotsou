import AsyncStorage from '@react-native-async-storage/async-storage'
import { createStore } from 'react-atomic-store'
import { ToastAndroid } from 'react-native'

import { TabsList } from '@/constants/Tabs'

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
    $tabsList: JSON.parse(JSON.stringify(TabsList)) as {
      name: string
      title: string
      url: string
      show: boolean
      builtIn?: boolean
      icon?: string
    }[],
    $checkAppUpdateTime: 0,
    $enableTextSelect: false,
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
        let list = JSON.parse(data) as AppContextValueType['$tabsList']
        // Filter out tabs that are no longer in TabsList (if builtIn)
        // OR are custom tabs but have no URL (unused placeholders from previous version)
        list = list.filter((v) => {
          const inTabsList = TabsList.find((t) => t.name === v.name)
          if (v.builtIn) {
            return !!inTabsList
          }
          // For custom tabs, keep only if they have a URL (meaning user used them)
          return !!v.url
        })

        const newAdded = TabsList.filter((t) => {
          return !list.find((v) => v.name === t.name)
        })
        list.push(...JSON.parse(JSON.stringify(newAdded)))

        for (const item of list) {
          const tab = TabsList.find((t) => t.name === item.name)
          if (!tab) {
            continue
          } // Skip custom tabs

          for (const key in tab) {
            if (!(key in item)) {
              // @ts-ignore
              item[key] = tab[key]
            } else if (tab.builtIn) {
              if (key !== 'show') {
                // @ts-ignore
                item[key] = tab[key]
              }
            } else {
              if (key !== 'show' && key !== 'title' && key !== 'url') {
                // @ts-ignore
                item[key] = tab[key]
              }
            }
          }
          if (item.url === 'https://') {
            item.url = ''
          }
          // Note: The original code had Object.assign here for builtIn items which overwrites 'show'.
          // We are preserving that behavior for builtIn items to ensure they stay up to date,
          // but we must be careful not to reset 'show' if that was the intent.
          // However, since 'show' is in TabsList, Object.assign WILL overwrite it.
          // Assuming the previous logic implies built-in tabs configuration (title/icon/url) is the source of truth,
          // but 'show' state should probably be preserved?
          // Let's safe-guard 'show' state for builtIn items.
          if (item.builtIn) {
            const savedShow = item.show
            Object.assign(item, tab)
            item.show = savedShow
          }
        }
        methods.set$tabsList(list)
      } else {
        methods[setKey](JSON.parse(data))
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
