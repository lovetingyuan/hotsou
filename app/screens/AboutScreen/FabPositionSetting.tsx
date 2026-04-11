import { View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { useStore } from '@/store'

export default function FabPositionSetting() {
  const { $fabPosition, set$fabPosition } = useStore()

  return (
    <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
      <ThemedText style={{ flex: 1 }}>刷新按钮位置(长按刷新全部)</ThemedText>
      <View style={{ flexDirection: 'row', gap: 12, flexShrink: 0 }}>
        <ThemedText
          onPress={() => set$fabPosition('left')}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 6,
            overflow: 'hidden',
            backgroundColor: $fabPosition === 'left' ? '#34C759' : '#e0e0e0',
            color: $fabPosition === 'left' ? '#fff' : '#333',
            fontSize: 14,
          }}
        >
          靠左
        </ThemedText>
        <ThemedText
          onPress={() => set$fabPosition('right')}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 6,
            overflow: 'hidden',
            backgroundColor: $fabPosition === 'right' ? '#34C759' : '#e0e0e0',
            color: $fabPosition === 'right' ? '#fff' : '#333',
            fontSize: 14,
          }}
        >
          靠右
        </ThemedText>
      </View>
    </View>
  )
}
