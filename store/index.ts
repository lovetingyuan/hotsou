import React from 'react'
import { createAtomicContext, useAtomicContext } from 'react-atomic-context'

export const getAppValue = () => {
  return {
    reloadAllTab: 0,
    reloadTab: [''],
  }
}

const AppContext = createAtomicContext(getAppValue())

export const AppContextProvider = AppContext.Provider

export function useAppValue() {
  return React.useMemo(getAppValue, [])
}

export function useStore() {
  return useAtomicContext(AppContext)
}
