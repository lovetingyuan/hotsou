import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer'
import { usePathname } from 'expo-router'
import Drawer from 'expo-router/drawer'
import { TouchableOpacity } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import HeaderRight from '@/components/HeaderRight'
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
      <ThemedView style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            // props.navigation.navigate('about')
            setReloadAllTab(Date.now())
          }}
        >
          <ThemedText style={{ padding: 20, textAlign: 'right' }}>刷新全部</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            props.navigation.navigate('about')
          }}
        >
          <ThemedText style={{ padding: 20, textAlign: 'right' }}>关于</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  )
}

export default function Layout() {
  const { setClickTab, reloadAllTab } = useStore()
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
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        key={reloadAllTab}
        screenOptions={{
          drawerStyle: {
            width: '45%',
          },
          headerTitleStyle: {
            // color: 'red',
          },
          headerTitle: getTitle,
          headerRight: getHeaderRight,
          // swipeEdgeWidth: 100,
          // swipeMinDistance: 20,
          drawerLabelStyle: {
            fontSize: 18,
            paddingHorizontal: 10,
          },
        }}
        drawerContent={getDrawerContent}
      >
        {TabsList.map(page => {
          return (
            <Drawer.Screen
              key={page.name}
              name={page.name} // This is the name of the page and must match the url from root
              options={{
                drawerLabel: page.title,
                title: page.title,
              }}
            />
          )
        })}
      </Drawer>
    </GestureHandlerRootView>
  )
}
