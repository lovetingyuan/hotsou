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
  const { initialed, get$checkAppUpdateTime, set$checkAppUpdateTime } = useStore()
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
    if (initialed && Date.now() - get$checkAppUpdateTime() > 5 * 24 * 60 * 60 * 1000) {
      checkAppUpdate()
        .then(r => {
          const currentVersion = Application.nativeApplicationVersion
          set$checkAppUpdateTime(Date.now())
          if (r && r.version !== currentVersion) {
            Alert.alert(
              '有新版本🎉',
              `\n${currentVersion} 更新到 ${r.version} \n\n${r.changelog}`,
              [
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
              ],
            )
          }
        })
        .catch(e => {
          console.log('[Check Update] Error:', e)
        })
    }
  }, [loaded, initialed, get$checkAppUpdateTime, set$checkAppUpdateTime])

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
