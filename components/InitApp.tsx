import '@/components/modules/init'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFonts } from 'expo-font'
import { SplashScreen } from 'expo-router'
import React, { useEffect } from 'react'
import { ProviderOnChangeType } from 'react-atomic-context'
import { Alert } from 'react-native'

import { TabsList } from '@/constants/Tabs'
import {
  AppContextProvider,
  AppContextValueType,
  StoredKeys,
  storedKeys,
  useAppValue,
  useMethods,
  useStore,
} from '@/store'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

const onChange: ProviderOnChangeType<AppContextValueType> = ({ key, value }, ctx) => {
  if (!ctx.getInitialed()) {
    return
  }
  if (key.startsWith('$')) {
    AsyncStorage.setItem(key, JSON.stringify(value))
  }
}

function App(props: React.PropsWithChildren) {
  const { setInitialed, initialed } = useStore()
  const methods = useMethods()
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })
  useEffect(() => {
    Promise.all(
      storedKeys.map(k => {
        const key = k as StoredKeys
        const setKey = `set${key}` as const
        return AsyncStorage.getItem(key).then(data => {
          if (!data) {
            return
          }
          if (key === '$tabsList') {
            const list = JSON.parse(data) as AppContextValueType['$tabsList']
            // eslint-disable-next-line sonarjs/no-nested-functions
            const tablist = TabsList.map(tab => {
              const item = list.find(v => v.name === tab.name)
              tab.show = item ? item.show : true
              return { ...tab }
            })
            methods.set$tabsList(tablist)
          } else {
            methods[setKey](JSON.parse(data))
          }
        })
      })
    ).then(() => {
      setInitialed(true)
    })
  }, [setInitialed, methods])

  useEffect(() => {
    if (loaded && initialed) {
      SplashScreen.hideAsync()
    }
  }, [loaded, initialed])

  if (!initialed || !loaded) {
    return null
  }

  return props.children
}

export default function InitApp(props: React.PropsWithChildren) {
  const appValue = useAppValue()

  useEffect(() => {
    AsyncStorage.getItem('__First_Usage_Time').then(r => {
      if (!r) {
        AsyncStorage.setItem('__First_Usage_Time', Date.now().toString())
        Alert.alert(
          '欢迎使用Hotsou',
          [
            '本应用简单聚合国内主流媒体的热搜信息，感谢使用',
            '仅做展示和浏览用，不会对信息做任何变动也不对任何信息真实性或后果负责，请勿轻易相信或传播。',
          ].join('\n')
        )
      }
    })
  }, [])

  return (
    <AppContextProvider value={appValue} onChange={onChange}>
      <App>{props.children}</App>
    </AppContextProvider>
  )
}
