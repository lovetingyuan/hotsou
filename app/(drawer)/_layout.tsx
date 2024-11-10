import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer'
import { usePathname } from 'expo-router'
import Drawer from 'expo-router/drawer'
import { ImageSourcePropType, TouchableOpacity } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import HeaderRight from '@/components/HeaderRight'
import Image2 from '@/components/Image2'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { TabsList } from '@/constants/Tabs'
import { useStore } from '@/store'

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { setReloadAllTab } = useStore()
  return (
    <ThemedView style={{ flex: 1 }}>
      {/* <ThemedText style={{ marginTop: 100 }}>热搜列表</ThemedText> */}
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <ThemedView style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#ddd' }}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={{ flexGrow: 1, padding: 20 }}
          onPress={() => {
            setReloadAllTab(Date.now())
            props.navigation.closeDrawer()
          }}
        >
          <ThemedText style={{ fontSize: 18, textAlign: 'center' }}>刷新全部</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          style={{ flexGrow: 1, padding: 20 }}
          onPress={() => {
            props.navigation.navigate('about')
            props.navigation.closeDrawer()
          }}
        >
          <ThemedText style={{ fontSize: 18, textAlign: 'center' }}>关于</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  )
}

export default function Layout() {
  const { setClickTab, reloadAllTab, $tabsList } = useStore()
  const info = usePathname()
  const getDrawerContent = (props: DrawerContentComponentProps) => {
    return <CustomDrawerContent {...props} />
  }
  const getHeaderRight = () => {
    return <HeaderRight />
  }
  const getTitle = (props: any) => {
    return (
      <ThemedText
        {...props}
        onPress={() => {
          setClickTab([info.slice(1)])
        }}
        style={{ fontSize: 20, fontWeight: '600' }}
      ></ThemedText>
    )
  }
  const getDrawerIcon = (page: (typeof TabsList)[0]) => {
    const defaultIcon = require('../../assets/images/favicon.png')
    let icon: ImageSourcePropType
    if (page.icon) {
      icon = { uri: page.icon }
    } else if (page.url) {
      try {
        const { hostname } = new URL(page.url)
        icon = { uri: `https://icon.horse/icon/${hostname}` }
        // eslint-disable-next-line sonarjs/no-ignored-exceptions
      } catch (err) {
        icon = defaultIcon
      }
    } else {
      icon = defaultIcon
    }

    return (
      <Image2
        fallbackSource={defaultIcon}
        source={icon}
        defaultSource={defaultIcon}
        style={{
          width: 28,
          height: 28,
          borderRadius: 4,
        }}
      ></Image2>
    )
  }
  const getDrawerLabel = (
    props: { color: string; focused: boolean },
    page: (typeof TabsList)[0]
  ) => {
    const title = page.builtIn ? page.title : $tabsList.find(v => v.name === page.name)?.title
    return (
      <ThemedText
        style={{
          fontSize: 18,
          color: props.color,
          fontWeight: props.focused ? '600' : '500',
        }}
      >
        {title}
      </ThemedText>
    )
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        key={reloadAllTab}
        screenOptions={{
          drawerStyle: {
            width: '50%',
          },
          headerTitle: getTitle,
          headerRight: getHeaderRight,
          swipeEdgeWidth: 200,
          swipeMinDistance: 30,
          // drawerType: 'slide',
          drawerLabelStyle: {
            fontSize: 18,
            paddingHorizontal: 10,
          },
        }}
        drawerContent={getDrawerContent}
      >
        {TabsList.map(page => {
          const title = page.builtIn ? page.title : $tabsList.find(v => v.name === page.name)?.title
          return (
            <Drawer.Screen
              key={page.name}
              name={page.name} // This is the name of the page and must match the url from root
              options={{
                drawerItemStyle: {
                  // borderWidth: 1,
                },
                drawerLabel: props => getDrawerLabel(props, page),
                title,
                drawerIcon: () => getDrawerIcon(page),
              }}
            />
          )
        })}
      </Drawer>
    </GestureHandlerRootView>
  )
}
