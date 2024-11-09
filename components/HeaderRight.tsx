import Ionicons from '@expo/vector-icons/Ionicons'
import { usePathname } from 'expo-router'
import { TouchableOpacity } from 'react-native'

import { useStore } from '@/store'

import { ThemedView } from './ThemedView'

export default function HeaderRight() {
  const pathname = usePathname()
  const { setReloadTab, setShowPageInfo } = useStore()
  return (
    <ThemedView
      style={{
        flexDirection: 'row',
        flexShrink: 0,
        alignItems: 'center',
        paddingHorizontal: 18,
        gap: 18,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={() => {
          setReloadTab([pathname.slice(1), true])
        }}
        onPress={() => {
          setReloadTab([pathname.slice(1), false])
        }}
      >
        <Ionicons name="reload" size={24} />
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          setShowPageInfo([pathname.slice(1)])
        }}
      >
        <Ionicons name="information-circle-outline" size={28} />
      </TouchableOpacity>
    </ThemedView>
  )
}
