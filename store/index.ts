import React from 'react'
import {
  createAtomicContext,
  useAtomicContext,
  useAtomicContextMethods,
} from 'react-atomic-context'

import { TabsList } from '@/constants/Tabs'

export const getAppValue = () => {
  return {
    initialed: false,
    reloadAllTab: 0,
    reloadTab: [''],
    $tabsList: JSON.parse(JSON.stringify(TabsList)) as typeof TabsList,
    $checkAppUpdateTime: 0,
  }
}

const initValue = getAppValue()

const AppContext = createAtomicContext(initValue)

export const AppContextProvider = AppContext.Provider

export function useAppValue() {
  return React.useMemo(getAppValue, [])
}

export function useStore() {
  return useAtomicContext(AppContext)
}

export function useMethods() {
  return useAtomicContextMethods(AppContext)
}

export type AppContextValueType = ReturnType<typeof getAppValue>

export type StoredKeys<K = keyof AppContextValueType> = K extends `$${string}` ? K : never

export const storedKeys = Object.keys(initValue).filter(k => k.startsWith('$')) as StoredKeys[]
