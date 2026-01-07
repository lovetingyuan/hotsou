import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
// import * as Sentry from '@sentry/react-native'
// import { isRunningInExpoGo } from 'expo'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SystemUI from 'expo-system-ui'
import React from 'react'
import { Platform, Share } from 'react-native'

import InitApp from '@/components/InitApp'
import ThemedIcon from '@/components/ThemedIcon'
import { useColorScheme } from '@/hooks/useColorScheme'

// Construct a new integration instance. This is needed to communicate between the integration and React
// const navigationIntegration = Sentry.reactNavigationIntegration({
//   enableTimeToInitialDisplay: !isRunningInExpoGo(),
// })

// Sentry.init({
//   dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
//   enabled: !__DEV__,
//   debug: __DEV__, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
//   tracesSampleRate: 1.0, // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing. Adjusting this value in production.
//   integrations: [
//     // Pass integration
//     navigationIntegration,
//   ],
//   enableNativeFramesTracking: !isRunningInExpoGo(), // Tracks slow and frozen frames in the application
// })

function RootLayout() {
  const colorScheme = useColorScheme()

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync(
        colorScheme === 'dark' ? '#000000' : '#ffffff'
      )
    }
  }, [colorScheme])

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
  // const ref = useNavigationContainerRef()

  // React.useEffect(() => {
  //   if (ref?.current) {
  //     navigationIntegration.registerNavigationContainer(ref)
  //   }
  // }, [ref])

  return (
    <InitApp>
      <StatusBar style="auto" />
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
          {/* <Stack.Screen
            name="modal"
            options={{
              presentation: 'modal',
            }}
          /> */}
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </InitApp>
  )
}

export default RootLayout
