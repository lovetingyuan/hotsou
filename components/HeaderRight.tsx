import { Image, TouchableOpacity } from 'react-native'

import { useStore } from '@/store'
import { getPageIcon } from '@/utils'

import ThemedIcon from './ThemedIcon'
import { ThemedView } from './ThemedView'

export default function HeaderRight(props: { pathname: string }) {
  const { setReloadTab, setShowPageInfo, $tabsList } = useStore()
  const { pathname } = props

  const page = $tabsList.find(t => t.name === pathname.slice(1))

  const pageIcon = getPageIcon(page)
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
      <TouchableOpacity
        activeOpacity={0.5}
        onLongPress={() => {
          setReloadTab([pathname.slice(1) || 'index', true])
        }}
        onPress={() => {
          setReloadTab([pathname.slice(1) || 'index', false])
        }}
        style={{ paddingVertical: 3, paddingHorizontal: 5, width: 36 }}
      >
        <ThemedIcon name="reload" size={24}></ThemedIcon>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.5}
        style={{ paddingVertical: 1, paddingHorizontal: 4, width: 36 }}
        onPress={() => {
          setShowPageInfo((pathname.slice(1) || 'index') + '_' + Date.now())
        }}
      >
        {/* <ThemedIcon name="information-circle-outline" size={28}></ThemedIcon> */}
        <Image
          source={pageIcon}
          style={{
            width: 24,
            height: 24,
          }}
        ></Image>
      </TouchableOpacity>
    </ThemedView>
  )
}
