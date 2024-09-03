import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import 'react-native-reanimated'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { useColorScheme } from '@/hooks/useColorScheme'
import { Alert } from 'react-native'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  useEffect(() => {
    AsyncStorage.getItem('__First_Usage_Time').then(r => {
      if (!r) {
        AsyncStorage.setItem('__First_Usage_Time', Date.now().toString())
        Alert.alert(
          '欢迎使用Hotsou',
          [
            '本应用简单聚合国内主流媒体的热搜信息，感谢使用',
            '仅做展示和浏览用，不会对信息做任何变动也不对任何信息负责',
          ].join('\n')
        )
      }
    })
  }, [])

  if (!loaded) {
    return null
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="about" options={{ title: '关于' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  )
}
