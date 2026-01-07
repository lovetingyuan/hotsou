import React from 'react'
// import {
//   createAtomicContext,
//   useAtomicContext,
//   useAtomicContextMethods,
// } from 'react-atomic-context'
import { createStore } from 'react-atomic-store'

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
    $tabsList: JSON.parse(JSON.stringify(TabsList)) as typeof TabsList,
    $checkAppUpdateTime: 0,
    $enableTextSelect: false,
    douyinHotId: '',
    douyinVideoId: '',
    activeTab: '',
  }
}

const initValue = getAppValue()

// const AppContext = createAtomicContext(initValue)

export const { useStore, getStoreMethods, subscribeStore, getStoreState } = createStore(
  getAppValue()
)

// export const AppContextProvider = AppContext.Provider

export function useAppValue() {
  return React.useMemo(getAppValue, [])
}

// export function useStore() {
//   return useAtomicContext(AppContext)
// }

// export function useMethods() {
//   return useAtomicContextMethods(AppContext)
// }

export type AppContextValueType = ReturnType<typeof getAppValue>

export type StoredKeys<K = keyof AppContextValueType> = K extends `$${string}` ? K : never

export const storedKeys = Object.keys(initValue).filter(k => k.startsWith('$')) as StoredKeys[]
