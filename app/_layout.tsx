import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import React from 'react'

import InitApp from '@/components/InitApp'
import { useColorScheme } from '@/hooks/useColorScheme'

export default function RootLayout() {
  const colorScheme = useColorScheme()

  return (
    <InitApp>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="about"
            options={{ title: '关于Hotsou', headerShown: true, headerShadowVisible: true }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </InitApp>
  )
}
