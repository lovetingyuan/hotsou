import { Ionicons } from '@expo/vector-icons'
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer'
import { HeaderTitleProps } from '@react-navigation/elements'
import { DrawerActions, useRoute } from '@react-navigation/native'
import { Image } from 'expo-image'
import React from 'react'
import { TouchableOpacity, View } from 'react-native'

import CustomPage from '@/components/CustomPage'
import HeaderRight from '@/components/HeaderRight'
import Image2 from '@/components/Image2'
import RefreshFab from '@/components/RefreshFab'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { TabsList, TabsName } from '@/constants/Tabs'
import { useColorScheme } from '@/hooks/useColorScheme'
import BaiduScreen from '@/screens/BaiduScreen'
import BilibiliScreen from '@/screens/BilibiliScreen'
import DouyinScreen from '@/screens/DouyinScreen'
import FenghuangScreen from '@/screens/FenghuangScreen'
import IthomeScreen from '@/screens/IthomeScreen'
import Kr36Screen from '@/screens/Kr36Screen'
import TengxunScreen from '@/screens/TengxunScreen'
import ToutiaoScreen from '@/screens/ToutiaoScreen'
import WangyiScreen from '@/screens/WangyiScreen'
import WeiboScreen from '@/screens/WeiboScreen'
// import WeiboScreen2 from '@/screens/WeiboScreen2'
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
  douyin_hotlist: undefined
  zhihu: undefined
  wangyi: undefined
  tengxun: undefined
  fenghuang: undefined
  bilibili: undefined
  kr36: undefined
  ithome: undefined
  // Dynamic tabs will work at runtime but may not be typed here
  About: undefined
}

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const colorScheme = useColorScheme()
  return (
    <ThemedView style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <ThemedView
          style={{
            marginTop: 10,
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: 20,
            marginBottom: 5,
            gap: 8,
          }}
        >
          <Image
            source={require('../assets/images/icon.png')}
            style={{ width: 24, height: 24, borderRadius: 6 }}
          />
          <ThemedText style={{ fontSize: 18, fontWeight: '600' }}>频道</ThemedText>
        </ThemedView>
        <DrawerItemList {...props} />
        <ThemedView style={{ height: 20 }}></ThemedView>
      </DrawerContentScrollView>
      <ThemedView
        style={{
          borderTopWidth: 1,
          borderTopColor: colorScheme === 'dark' ? '#333' : '#f0f0f0',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
          zIndex: 1,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            padding: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
          onPress={() => {
            props.navigation.navigate('About')
            props.navigation.closeDrawer()
          }}
        >
          <Ionicons
            name='information-circle-outline'
            size={22}
            color={colorScheme === 'dark' ? '#fff' : '#000'}
          />
          <ThemedText style={{ fontSize: 18, textAlign: 'center' }}>关于</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  )
}

function DrawerNavigator() {
  const { setClickTab, reloadAllTab, $tabsList, setActiveTab } = useStore()
  const route = useRoute()
  const colorScheme = useColorScheme()
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const getHeaderRight = () => {
    return <HeaderRight />
  }

  const getHeaderLeft = (toggleDrawer: () => void, color?: string) => {
    return (
      <TouchableOpacity
        accessibilityLabel='打开抽屉菜单'
        accessibilityRole='button'
        activeOpacity={0.8}
        hitSlop={12}
        onPress={toggleDrawer}
        style={{ marginLeft: 16, paddingVertical: 6, paddingRight: 8 }}
      >
        <Ionicons name='menu' size={26} color={color ?? (colorScheme === 'dark' ? 'white' : 'black')} />
      </TouchableOpacity>
    )
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
    page: (typeof TabsList)[0],
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
    <View style={{ flex: 1 }}>
      <Drawer.Navigator
        screenOptions={({ navigation }) => ({
          drawerStyle: {
            width: '62%',
          },
          // Avoid Metro dev-server requests for React Navigation's packaged PNG toggle icon.
          headerLeft: ({ tintColor }) =>
            getHeaderLeft(() => navigation.dispatch(DrawerActions.toggleDrawer()), tintColor),
          headerTitle: getTitle,
          headerRight: getHeaderRight,
          swipeEdgeWidth: 80,
          headerTintColor: colorScheme === 'dark' ? 'white' : 'black',
          swipeMinDistance: 30,
        })}
        screenListeners={{
          state: (e) => {
            const state = (e.data as any)?.state
            if (state) {
              setDrawerOpen(state.history?.some((h: any) => h.type === 'drawer') ?? false)
            }
          },
        }}
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
      {$tabsList
        .map((page) => {
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
                  : // : page.name === TabsName.weibo2
                    // ? WeiboScreen2
                    page.name === TabsName.baidu
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
                                  : page.name === TabsName.kr36
                                    ? Kr36Screen
                                    : page.name === TabsName.ithome
                                      ? IthomeScreen
                                      : CustomPage
              }
              options={{
                drawerLabel: (props) => getDrawerLabel(props, page as any),
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
      {!drawerOpen && <RefreshFab />}
    </View>
  )
}

export default DrawerNavigator
