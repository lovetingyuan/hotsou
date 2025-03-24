import './init'

import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Application from 'expo-application'
import { useFonts } from 'expo-font'
import { SplashScreen } from 'expo-router'
import React, { useEffect } from 'react'
import { ProviderOnChangeType } from 'react-atomic-context'
import { Alert, Linking, ToastAndroid } from 'react-native'

import { TabsList } from '@/constants/Tabs'
import useMounted from '@/hooks/useMounted'
import {
  AppContextProvider,
  AppContextValueType,
  StoredKeys,
  storedKeys,
  useAppValue,
  useMethods,
  useStore,
} from '@/store'
import checkAppUpdate from '@/utils/checkAppUpdate'
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

const onChange: ProviderOnChangeType<AppContextValueType> = ({ key, value }, ctx) => {
  if (!ctx.getInitialed()) {
    return
  }
  if (key.startsWith('$')) {
    AsyncStorage.setItem(key, JSON.stringify(value)).catch((err: any) => {
      ToastAndroid.show('抱歉，应用发生了错误', ToastAndroid.SHORT)
      throw err
    })
  }
}

const fulfillStoreKeys = (methods: ReturnType<typeof useMethods>) => {
  return Promise.all(
    // eslint-disable-next-line sonarjs/cognitive-complexity
    storedKeys.map(async k => {
      const key = k as StoredKeys
      const setKey = `set${key}` as const
      const data = await AsyncStorage.getItem(key)
      if (!data) {
        return
      }
      if (key === '$tabsList') {
        let list = JSON.parse(data) as AppContextValueType['$tabsList']
        list = list.filter(v => {
          return TabsList.find(t => t.name === v.name)
        })
        const newAdded = TabsList.filter(t => {
          return !list.find(v => v.name === t.name)
        })
        list.push(...JSON.parse(JSON.stringify(newAdded)))
        for (const item of list) {
          const tab = TabsList.find(t => t.name === item.name)
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
          if (item.builtIn) {
            Object.assign(item, tab)
          }
        }
        methods.set$tabsList(list)
      } else {
        methods[setKey](JSON.parse(data))
      }
    })
  )
}

function App(props: React.PropsWithChildren) {
  const { setInitialed, initialed, get$checkAppUpdateTime, set$checkAppUpdateTime } = useStore()
  const methods = useMethods()
  const [loaded] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
  })
  useMounted(() => {
    fulfillStoreKeys(methods)
      .then(() => {
        setInitialed(true)
      })
      .catch(err => {
        ToastAndroid.show('抱歉，应用发生了错误!', ToastAndroid.SHORT)
        throw err
      })
  })

  useEffect(() => {
    if (loaded && initialed) {
      SplashScreen.hideAsync()
    }
    if (initialed && Date.now() - get$checkAppUpdateTime() > 5 * 24 * 60 * 60 * 1000) {
      checkAppUpdate().then(r => {
        const currentVersion = Application.nativeApplicationVersion
        set$checkAppUpdateTime(Date.now())
        if (r && r.version !== currentVersion) {
          Alert.alert('有新版本🎉', `\n${currentVersion} 更新到 ${r.version} \n\n${r.changelog}`, [
            {
              text: '取消',
            },
            {
              text: '下载',
              onPress: () => {
                ToastAndroid.show('请在浏览器中下载并信任安装', ToastAndroid.SHORT)
                Linking.openURL(r.downloadUrl)
              },
            },
          ])
        }
      })
    }
  }, [loaded, initialed, get$checkAppUpdateTime, set$checkAppUpdateTime])
  useMounted(() => {
    fetch('https://cdn.jsdelivr.net/gh/lovetingyuan/hotsou@main/app.json')
      .then(r => r.json())
      .then(appConfig => {
        const config = appConfig.expo.extra.$config
        if (config && config.show) {
          Alert.alert(
            'Hello',
            config.statement,
            [
              {
                text: '确定',
              },
              config.url
                ? {
                    text: '详情',
                    onPress: () => {
                      Linking.openURL(config.url)
                    },
                  }
                : null,
            ].filter(v => v !== null)
          )
        }
      })
  })

  if (!initialed || !loaded) {
    return null
  }

  return props.children
}

function RootLayout(props: React.PropsWithChildren) {
  const appValue = useAppValue()

  useMounted(() => {
    AsyncStorage.getItem('__First_Usage_Time').then((r: string | null) => {
      if (r) {
        return
      }
      Alert.alert(
        '欢迎使用 Hotsou',
        [
          '本应用简单聚合国内主流媒体的热搜信息，感谢使用',
          '仅做展示和浏览用，不会对信息做任何变动也不对任何信息真实性或后果负责，请勿轻易相信或传播😀。',
        ].join('\n'),
        [
          {
            text: '同意',
            isPreferred: true,
            onPress: () => {
              AsyncStorage.setItem('__First_Usage_Time', Date.now().toString())
            },
          },
        ]
      )
    })
  })

  return (
    <AppContextProvider value={appValue} onChange={onChange}>
      <App>{props.children}</App>
    </AppContextProvider>
  )
}

export default RootLayout
