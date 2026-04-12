import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import * as SystemUI from 'expo-system-ui'
import React from 'react'
import { Platform } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { DataSync } from '@/components/DataSync'
import ErrorBoundary from '@/components/ErrorBoundary'
import InitApp from '@/components/InitApp'
import { Colors } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'
import RootNavigator from '@/navigation'

function App() {
  const colorScheme = useColorScheme()

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync(colorScheme === 'dark' ? '#000000' : '#ffffff')
    }
  }, [colorScheme])

  const navigationTheme = {
    ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(colorScheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      primary: Colors[colorScheme === 'dark' ? 'dark' : 'light'].primary,
    },
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <InitApp>
          <StatusBar style='auto' />
          <DataSync />
          <NavigationContainer theme={navigationTheme}>
            <RootNavigator />
          </NavigationContainer>
        </InitApp>
      </ErrorBoundary>
    </GestureHandlerRootView>
  )
}

export default App
