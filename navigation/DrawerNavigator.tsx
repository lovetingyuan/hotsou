import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer'
import { HeaderTitleProps } from '@react-navigation/elements'
import { useRoute } from '@react-navigation/native'
import React from 'react'
import { TouchableOpacity } from 'react-native'

import CustomPage from '@/components/CustomPage'
import HeaderRight from '@/components/HeaderRight'
import Image2 from '@/components/Image2'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { TabsList, TabsName } from '@/constants/Tabs'
import { useColorScheme } from '@/hooks/useColorScheme'
import BaiduScreen from '@/screens/BaiduScreen'
import BilibiliScreen from '@/screens/BilibiliScreen'
import DouyinScreen from '@/screens/DouyinScreen'
import FenghuangScreen from '@/screens/FenghuangScreen'
import TengxunScreen from '@/screens/TengxunScreen'
import ToutiaoScreen from '@/screens/ToutiaoScreen'
import WangyiScreen from '@/screens/WangyiScreen'
import WeiboScreen from '@/screens/WeiboScreen'
import ZhihuScreen from '@/screens/ZhihuScreen'
import { useStore } from '@/store'
import { getPageIcon } from '@/utils'

export type DrawerParamList = {
  index: undefined
  // Built-in tabs
  weibo: undefined
  weibo2: undefined
  baidu: undefined
  toutiao: undefined
  douyin: undefined
  zhihu: undefined
  wangyi: undefined
  tengxun: undefined
  fenghuang: undefined
  bilibili: undefined
  // Dynamic tabs will work at runtime but may not be typed here
  About: undefined
}

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const colorScheme = useColorScheme()
  const { setReloadAllTab } = useStore()
  return (
    <ThemedView style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <ThemedView style={{ marginTop: 10 }}>
          <ThemedText style={{ marginLeft: 20, height: 30, fontSize: 18 }}># 频道</ThemedText>
        </ThemedView>
        <DrawerItemList {...props} />
        <ThemedView style={{ height: 20 }}></ThemedView>
      </DrawerContentScrollView>
      <ThemedView
        style={{
          flexDirection: 'row',
          shadowColor: colorScheme === 'dark' ? '#fff' : '#000',
          shadowOffset: {
            width: 0,
            height: -10,
          },
          shadowOpacity: 0.8,
          shadowRadius: 20,
          elevation: 24,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          style={{ flexGrow: 1, padding: 20 }}
          onPress={() => {
            setReloadAllTab(Date.now())
            props.navigation.closeDrawer()
          }}
        >
          <ThemedText style={{ fontSize: 18, textAlign: 'center' }}>🔄 刷新全部</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          style={{ flexGrow: 1, padding: 20 }}
          onPress={() => {
            props.navigation.navigate('About')
            props.navigation.closeDrawer()
          }}
        >
          <ThemedText style={{ fontSize: 18, textAlign: 'center' }}>⚙️ 关于</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  )
}

function DrawerNavigator() {
  const { setClickTab, reloadAllTab, $tabsList, setActiveTab } = useStore()
  const route = useRoute()
  const colorScheme = useColorScheme()

  const getHeaderRight = () => {
    return <HeaderRight />
  }

  const getTitle = (props: HeaderTitleProps) => {
    return (
      <ThemedText
        onPress={() => {
          setClickTab([route.name])
        }}
        style={{ fontSize: 20, fontWeight: '600', flexShrink: 1, marginRight: 30 }}
        numberOfLines={1}
      >
        {props.children}
      </ThemedText>
    )
  }

  const getDrawerIcon = (page: (typeof TabsList)[0]) => {
    const icon = getPageIcon(page)
    const defaultIcon = require('../assets/images/favicon.png')
    return (
      <Image2
        fallbackSource={defaultIcon}
        source={icon}
        defaultSource={defaultIcon}
        style={{
          width: 28,
          height: 28,
          borderRadius: 4,
          alignSelf: 'flex-start',
          position: 'relative',
          top: 2,
        }}
      ></Image2>
    )
  }

  const getDrawerLabel = (
    props: { color: string; focused: boolean },
    page: (typeof TabsList)[0]
  ) => {
    return (
      <ThemedText
        style={{
          fontSize: 18,
          color: props.color,
          fontWeight: props.focused ? '600' : '500',
        }}
        numberOfLines={3}
      >
        {page.title}
      </ThemedText>
    )
  }

  const Drawer = createDrawerNavigator<DrawerParamList>()

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {
          width: '62%',
        },
        headerTitle: getTitle,
        headerRight: getHeaderRight,
        swipeEdgeWidth: 80,
        headerTintColor: colorScheme === 'dark' ? 'white' : 'black',
        swipeMinDistance: 30,
      }}
      drawerContent={props => <CustomDrawerContent {...props} />}
    >
      {$tabsList
        .map(page => {
          if (!page.show) {
            return null
          }
          return (
            <Drawer.Screen
              key={page.name + '-' + reloadAllTab}
              name={page.name as keyof DrawerParamList}
              component={
                page.name === TabsName.weibo
                  ? WeiboScreen
                  : page.name === TabsName.baidu
                  ? BaiduScreen
                  : page.name === TabsName.toutiao
                  ? ToutiaoScreen
                  : page.name === TabsName.douyin
                  ? DouyinScreen
                  : page.name === TabsName.zhihu
                  ? ZhihuScreen
                  : page.name === TabsName.wangyi
                  ? WangyiScreen
                  : page.name === TabsName.tengxun
                  ? TengxunScreen
                  : page.name === TabsName.fenghuang
                  ? FenghuangScreen
                  : page.name === TabsName.bilibili
                  ? BilibiliScreen
                  : CustomPage
              }
              options={{
                drawerLabel: props => getDrawerLabel(props, page as any),
                title: page.title,
                drawerIcon: () => getDrawerIcon(page as any),
              }}
              listeners={{
                focus: () => {
                  setActiveTab(page.name)
                },
              }}
            />
          )
        })
        .filter(Boolean)}
    </Drawer.Navigator>
  )
}

export default DrawerNavigator
