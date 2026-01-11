import { useRoute } from '@react-navigation/native'
import { Image, TouchableOpacity } from 'react-native'

import { useStore } from '@/store'
import { getPageIcon } from '@/utils'

import ThemedIcon from './ThemedIcon'
import { ThemedView } from './ThemedView'

export default function HeaderRight() {
  const { setReloadTab, setShowPageInfo, $tabsList, setShareInfo } = useStore()
  // const { pathname } = props
  const route = useRoute()
  const page = $tabsList.find(t => t.name === route.name)
  if (!page) {
    return null
  }
  return (
    <ThemedView
      style={{
        flexDirection: 'row',
        flexShrink: 0,
        alignItems: 'center',
        paddingHorizontal: 18,
        gap: 14,
        backgroundColor: 'transparent',
      }}
    >
      {/* <Link href="/modal">
        <Image
          source={pageIcon}
          style={{
            width: 24,
            height: 24,
          }}
        ></Image>
      </Link> */}
      <TouchableOpacity
        activeOpacity={0.5}
        style={{ paddingVertical: 1, paddingHorizontal: 4, width: 36 }}
        onPress={() => {
          setShowPageInfo([page.name])
        }}
        onLongPress={() => {
          setShareInfo([page.name])
        }}
      >
        {/* <ThemedIcon name="information-circle-outline" size={28}></ThemedIcon> */}

        <Image
          source={getPageIcon(page)}
          style={{
            width: 24,
            height: 24,
            borderRadius: 4,
          }}
        ></Image>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.5}
        onLongPress={() => {
          setReloadTab([page.name, true])
        }}
        onPress={() => {
          setReloadTab([page.name, false])
        }}
        style={{ paddingVertical: 3, paddingHorizontal: 5, width: 36 }}
      >
        <ThemedIcon name="reload" size={24}></ThemedIcon>
      </TouchableOpacity>
    </ThemedView>
  )
}
