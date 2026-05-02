import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Application from 'expo-application'
// import Constants from 'expo-constants'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Linking, ToastAndroid } from 'react-native'

import * as authApi from '@/api/auth'
import { LoginModal } from '@/components/LoginModal'
import { fulfillStoreKeys, getStoreMethods, getStoreState, subscribeStore, useStore } from '@/store'
import { subscribeAuthExpired } from '@/utils/authSession'
import { clearToken, getAuthData, setAuthData, updateToken } from '@/utils/secureStore'
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

  const [reAuthEmail, setReAuthEmail] = useState<string | null>(null)
  const [showReAuthModal, setShowReAuthModal] = useState(false)

  useEffect(() => {
    return subscribeAuthExpired((email) => {
      setReAuthEmail(email)
      setShowReAuthModal(true)
    })
  }, [])

  // 启动时验证登录状态，如果 token 过期则弹出重新验证弹窗
  useEffect(() => {
    getAuthData().then(async ({ email, token }) => {
      if (!email) {
        getStoreMethods().setIsLogin(false)
        return
      }
      if (!token) {
        // 有邮箱但没有 token，需要重新验证
        getStoreMethods().setIsLogin(false)
        setReAuthEmail(email)
        setShowReAuthModal(true)
        return
      }
      // 有邮箱和 token，调用接口验证
      const result = await authApi.checkAuthStatus(email, token)
      if (!result.success && !result.valid) {
        getStoreMethods().setIsLogin(false)
        return
      }
      if (result.valid) {
        if (result.newToken) {
          await updateToken(result.newToken)
        }
        getStoreMethods().setIsLogin(true)
      } else {
        // token 过期，清除 token 并弹出重新验证弹窗
        await clearToken()
        getStoreMethods().setIsLogin(false)
        setReAuthEmail(email)
        setShowReAuthModal(true)
      }
    })
  }, [])

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

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

  const handleReAuthSendOtp = useCallback(async (email: string) => {
    return authApi.sendOtp(email)
  }, [])

  const handleReAuthVerifyOtp = useCallback(async (email: string, otp: string) => {
    const result = await authApi.verifyOtp(email, otp)
    if (result.success && result.token) {
      await setAuthData(email, result.token)
      getStoreMethods().setIsLogin(true)
      setShowReAuthModal(false)
    } else {
      await clearToken()
    }
    return result
  }, [])

  const closeReAuthModal = useCallback(() => {
    setShowReAuthModal(false)
  }, [])

  if (!initialed || !loaded) {
    return null
  }

  return (
    <>
      {props.children}
      <LoginModal
        visible={showReAuthModal}
        onClose={closeReAuthModal}
        mode='reauth'
        initialEmail={reAuthEmail}
        onSendOtp={handleReAuthSendOtp}
        onVerifyOtp={handleReAuthVerifyOtp}
      />
    </>
  )
}

export default App
