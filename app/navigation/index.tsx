import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'

import AboutScreen from '@/screens/AboutScreen'

import DrawerNavigator from './DrawerNavigator'

export type RootStackParamList = {
  Drawer: undefined
  About: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name='Drawer' component={DrawerNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name='About'
        component={AboutScreen}
        options={{
          title: '关于Hotsou',
        }}
      />
    </Stack.Navigator>
  )
}

export default RootNavigator
