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
  const tabs = [
    {
      name: 'index',
      title: '微博',
    },
    {
      name: 'baidu',
      title: '百度',
    },
    {
      name: 'toutiao',
      title: '头条',
    },
    {
      name: 'zhihu',
      title: '知乎',
    },
    {
      name: 'li',
      title: 'LI',
    },
  ].map(item => {
    return (
      <Tabs.Screen
        name={item.name}
        key={item.name}
        options={{
          title: item.title,
          tabBarLabelPosition: 'beside-icon',
          tabBarAllowFontScaling: true,
          tabBarIcon: undefined,
          tabBarLabel: getTabBarLabel,
          tabBarIconStyle,
        }}
      />
    )
  })
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
        }}
      >
        {tabs}
      </Tabs>
    </>
  )
}
