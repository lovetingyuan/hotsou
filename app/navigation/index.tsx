import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import { Share, TouchableOpacity } from 'react-native'

import ThemedIcon from '@/components/ThemedIcon'
import AboutScreen from '@/screens/AboutScreen'

import DrawerNavigator from './DrawerNavigator'

export type RootStackParamList = {
  Drawer: undefined
  About: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

function RootNavigator() {
  const onShare = async () => {
    try {
      await Share.share({
        title: 'HotSou',
        message: 'HotSou - 全网热搜聚合 https://github.com/lovetingyuan/hotsou',
        url: 'https://github.com/lovetingyuan/hotsou',
      })
    } catch {
      // ignore
    }
  }

  return (
    <Stack.Navigator>
      <Stack.Screen name='Drawer' component={DrawerNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name='About'
        component={AboutScreen}
        options={{
          title: '关于Hotsou',
          headerRight: () => (
            <TouchableOpacity onPress={onShare} style={{ padding: 8 }}>
              <ThemedIcon name='share-outline' size={24} />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack.Navigator>
  )
}

export default RootNavigator
