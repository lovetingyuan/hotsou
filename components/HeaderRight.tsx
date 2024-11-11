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
        gap: 18,
        backgroundColor: 'transparent',
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
        style={{ padding: 5 }}
      >
        <ThemedIcon name="reload" size={24}></ThemedIcon>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.5}
        style={{ padding: 3 }}
        onPress={() => {
          setShowPageInfo((pathname.slice(1) || 'weibo') + '_' + Date.now())
        }}
      >
        <ThemedIcon name="information-circle-outline" size={28}></ThemedIcon>
      </TouchableOpacity>
    </ThemedView>
  )
}
