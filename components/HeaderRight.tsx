import { TouchableOpacity } from 'react-native'

import { useStore } from '@/store'

import ThemedIcon from './ThemedIcon'
import { ThemedView } from './ThemedView'

export default function HeaderRight(props: { pathname: string }) {
  const { setReloadTab, setShowPageInfo } = useStore()
  const { pathname } = props
  return (
    <ThemedView
      style={{
        flexDirection: 'row',
        flexShrink: 0,
        alignItems: 'center',
        paddingHorizontal: 18,
        gap: 14,
        backgroundColor: 'transparent',
        // borderWidth: 1,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.5}
        onLongPress={() => {
          setReloadTab([pathname.slice(1) || 'weibo', true])
        }}
        onPress={() => {
          setReloadTab([pathname.slice(1) || 'weibo', false])
        }}
        style={{ paddingVertical: 3, paddingHorizontal: 5, width: 36 }}
      >
        <ThemedIcon name="reload" size={24}></ThemedIcon>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.5}
        style={{ paddingVertical: 1, paddingHorizontal: 4, width: 36 }}
        onPress={() => {
          setShowPageInfo((pathname.slice(1) || 'weibo') + '_' + Date.now())
        }}
      >
        <ThemedIcon name="information-circle-outline" size={28}></ThemedIcon>
      </TouchableOpacity>
    </ThemedView>
  )
}
