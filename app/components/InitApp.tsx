import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Application from 'expo-application'
// import Constants from 'expo-constants'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import React, { useEffect } from 'react'
import { Alert, Linking, ToastAndroid } from 'react-native'

import { useAuth } from '@/hooks/useAuth'
import { fulfillStoreKeys, getStoreState, subscribeStore, useStore } from '@/store'
import checkAppUpdate from '@/utils/checkAppUpdate'

const APP_UPDATE_PROMPT_INTERVAL = 7 * 24 * 60 * 60 * 1000

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

subscribeStore(({ key, value }) => {
  const { initialed } = getStoreState()
  if (!initialed) {
    return
  }
  if (key.startsWith('$')) {
    AsyncStorage.setItem(key, JSON.stringify(value)).catch((err: any) => {
      ToastAndroid.show('抱歉，应用发生了错误', ToastAndroid.SHORT)
      throw err
    })
  }
})
fulfillStoreKeys()

function App(props: React.PropsWithChildren) {
  const {
    initialed,
    get$lastPromptedAppVersion,
    get$lastPromptedAppVersionTime,
    set$lastPromptedAppVersion,
    set$lastPromptedAppVersionTime,
  } = useStore()
  useAuth()
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  useEffect(() => {
    fulfillStoreKeys()
  }, [])

  useEffect(() => {
    if (loaded && initialed) {
      SplashScreen.hideAsync()
    }
  }, [loaded, initialed])

  useEffect(() => {
    if (!initialed) {
      return
    }

    checkAppUpdate()
      .then((r) => {
        const currentVersion = Application.nativeApplicationVersion
        if (r && r.version !== currentVersion) {
          const now = Date.now()
          const lastPromptedVersion = get$lastPromptedAppVersion()
          const lastPromptedAt = get$lastPromptedAppVersionTime()
          const promptedSameVersionRecently =
            lastPromptedVersion === r.version && now - lastPromptedAt < APP_UPDATE_PROMPT_INTERVAL

          if (promptedSameVersionRecently) {
            return
          }

          set$lastPromptedAppVersion(r.version)
          set$lastPromptedAppVersionTime(now)
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
      .catch((e) => {
        console.log('[Check Update] Error:', e)
      })
  }, [
    initialed,
    get$lastPromptedAppVersion,
    get$lastPromptedAppVersionTime,
    set$lastPromptedAppVersion,
    set$lastPromptedAppVersionTime,
  ])

  useEffect(() => {
    AsyncStorage.getItem('__First_Usage_Time').then((r: string | null) => {
      if (r) {
        return
      }
      Alert.alert(
        '欢迎使用 HotSou',
        [
          '本应用简单聚合国内主流媒体的热搜信息，感谢使用！',
          '信息均来自第三方平台，本应用仅供浏览，请勿轻易相信或传播😀。',
        ].join('\n'),
        [
          {
            text: '同意',
            isPreferred: true,
            onPress: () => {
              AsyncStorage.setItem('__First_Usage_Time', Date.now().toString())
            },
          },
        ],
      )
    })
  }, [])

  if (!initialed || !loaded) {
    return null
  }

  return props.children
}

export default App
