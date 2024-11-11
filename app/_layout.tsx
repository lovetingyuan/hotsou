import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import React from 'react'
import { Share } from 'react-native'

import InitApp from '@/components/InitApp'
import ThemedIcon from '@/components/ThemedIcon'
import { useColorScheme } from '@/hooks/useColorScheme'

export default function RootLayout() {
  const colorScheme = useColorScheme()

  const headerRight = () => {
    return (
      <ThemedIcon
        name="share-social"
        size={22}
        style={{ padding: 6 }}
        onPress={() => {
          Share.share({
            title: '欢迎使用Hotsou',
            message:
              '欢迎使用Hotsou，来看各种热搜\n下载：https://github.com/lovetingyuan/hotsou/releases/latest',
            // url: 'https://github.com/lovetingyuan/hotsou/releases/latest',
          })
        }}
      ></ThemedIcon>
    )
  }
  return (
    <InitApp>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
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
