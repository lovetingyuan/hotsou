import { Tabs } from 'expo-router'
import React from 'react'

import { Colors } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'
import { Pressable, Text } from 'react-native'

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
          tabBarButton: props => {
            // @ts-ignore
            const textNode = props.children.props.children[1]
            return (
              <Pressable
                onPress={evt => {
                  props.onPress?.(evt)
                }}
                // onLongPress={() => {
                //   // console.log(item.name)
                // }}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
              >
                {textNode}
              </Pressable>
            )
          },
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
