import { Tabs } from 'expo-router'
import React from 'react'
import { Pressable, Text } from 'react-native'

import { Colors } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'

const getTabBarLabel = (props: { focused: boolean; color: string; children: string }) => {
  return (
    <Text
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

export default function TabLayout() {
  const colorScheme = useColorScheme()

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
      name: 'douyin',
      title: '抖音',
    },
    {
      name: 'zhihu',
      title: '知乎',
    },
    {
      name: 'li',
      title: '木子',
    },
  ].map(item => {
    const tabBarButton = (
      props: import('@react-navigation/bottom-tabs').BottomTabBarButtonProps
    ) => {
      // @ts-ignore
      const textNode = props.children.props.children[1]
      return (
        <Pressable
          onPress={evt => {
            props.onPress?.(evt)
          }}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          {textNode}
        </Pressable>
      )
    }
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
          tabBarButton,
        }}
      />
    )
  })
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}
    >
      {tabs}
    </Tabs>
  )
}
