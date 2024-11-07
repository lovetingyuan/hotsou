import Entypo from '@expo/vector-icons/Entypo'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import React from 'react'
import { Share } from 'react-native'

import InitApp from '@/components/InitApp'
import { useColorScheme } from '@/hooks/useColorScheme'

const headerRight = () => {
  return (
    <Entypo
      name="share"
      size={20}
      style={{ padding: 8 }}
      onPress={() => {
        Share.share({
          title: '欢迎使用Hotsou',
          message:
            '欢迎使用Hotsou，来看各种热搜\n下载：https://github.com/lovetingyuan/hotsou/releases/latest',
          // url: 'https://github.com/lovetingyuan/hotsou/releases/latest',
        })
      }}
    ></Entypo>
  )
}

export default function RootLayout() {
  const colorScheme = useColorScheme()

  return (
    <InitApp>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="about"
            options={{
              title: '关于Hotsou',
              headerRight,
            }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </InitApp>
  )
}
