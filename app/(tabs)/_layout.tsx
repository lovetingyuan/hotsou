import { Tabs, usePathname } from 'expo-router'
import React from 'react'
import { Pressable, Text } from 'react-native'

import { Colors } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'
import { useStore } from '@/store'

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
  const pathname = usePathname()
  const { reloadAllTab, setReloadTab, $tabsList, setClickTab } = useStore()
  const tabBarIconStyle = {
    width: 0,
    height: 0,
    padding: 0,
    margin: 0,
  }
  const tabs = $tabsList
    .filter(v => v.show)
    .map(item => {
      const tabBarButton = (
        props: import('@react-navigation/bottom-tabs').BottomTabBarButtonProps
      ) => {
        // @ts-ignore
        const textNode = props.children.props.children[1]
        const text = (
          <Text {...textNode.props} adjustsFontSizeToFit numberOfLines={2}>
            {' '}
            {textNode.props.children}{' '}
          </Text>
        )
        return (
          <Pressable
            onPress={evt => {
              props.onPress?.(evt)
              if (pathname.endsWith(item.name)) {
                setClickTab(item.name + '_' + Date.now())
              }
            }}
            onLongPress={() => {
              setReloadTab([item.name])
            }}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {text}
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
      key={'tabs_' + reloadAllTab}
    >
      {tabs}
    </Tabs>
  )
}
