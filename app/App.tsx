import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  ThemeProvider,
} from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import * as SystemUI from 'expo-system-ui'
import React from 'react'
import { Platform } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { DataSync } from '@/components/DataSync'
import InitApp from '@/components/InitApp'
import { useColorScheme } from '@/hooks/useColorScheme'
import RootNavigator from '@/navigation'

function App() {
  const colorScheme = useColorScheme()

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync(colorScheme === 'dark' ? '#000000' : '#ffffff')
    }
  }, [colorScheme])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <InitApp>
        <StatusBar style='auto' />
        <DataSync />
        <NavigationContainer>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <RootNavigator />
          </ThemeProvider>
        </NavigationContainer>
      </InitApp>
    </GestureHandlerRootView>
  )
}

export default App
