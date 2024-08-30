import { Tabs } from 'expo-router'
import React from 'react'

import { Colors } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'
import { Text } from 'react-native'

export default function TabLayout() {
  const colorScheme = useColorScheme()
  const getTabBarLabel = (props: { focused: boolean; color: string; children: string }) => {
    return (
      <Text
        // onLongPress={() => {
        //   alert(9)
        // }}
        style={{
          color: props.color,
          fontSize: 18,
          fontWeight: props.focused ? 'bold' : 'normal',
        }}
      >
        {props.children}
      </Text>
    )
  }
  const tabBarIconStyle = {
    width: 0,
    height: 0,
    padding: 0,
    margin: 0,
  }
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: '微博热搜',
            tabBarLabelPosition: 'beside-icon',
            tabBarAllowFontScaling: true,
            tabBarIcon: undefined,
            tabBarLabel: getTabBarLabel,
            tabBarIconStyle,
          }}
        />
        <Tabs.Screen
          name="baidu"
          options={{
            title: '百度热搜',
            tabBarLabelPosition: 'beside-icon',
            tabBarLabel: getTabBarLabel,
            tabBarAllowFontScaling: true,
            tabBarIconStyle,
          }}
        />
        <Tabs.Screen
          name="zhihu"
          options={{
            title: '知乎热搜',
            tabBarIcon: undefined,
            tabBarLabel: getTabBarLabel,
            tabBarLabelPosition: 'beside-icon',
            tabBarIconStyle,
          }}
        />
      </Tabs>
    </>
  )
}
