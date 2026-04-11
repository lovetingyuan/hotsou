import { useRoute } from '@react-navigation/native'
import { Image, TouchableOpacity } from 'react-native'

import { useStore } from '@/store'
import { getPageIcon } from '@/utils'

import { ThemedView } from './ThemedView'

export default function HeaderRight() {
  const { setShowPageInfo, $tabsList, setShareInfo } = useStore()
  const route = useRoute()
  const page = $tabsList.find((t) => t.name === route.name)
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
        <Image
          source={getPageIcon(page)}
          style={{
            width: 24,
            height: 24,
            borderRadius: 4,
          }}
        ></Image>
      </TouchableOpacity>
    </ThemedView>
  )
}
