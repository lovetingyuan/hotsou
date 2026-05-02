import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { useStore } from '@/store'

export default function FabPositionSetting() {
  const { $fabPosition, set$fabPosition } = useStore()

  return (
    <View style={styles.settingRow}>
      <ThemedText style={styles.settingLabel} numberOfLines={2}>
        刷新按钮位置(长按刷新全部)
      </ThemedText>
      <View style={styles.settingControl}>
        <ThemedText
          onPress={() => set$fabPosition('left')}
          style={[
            styles.positionButton,
            {
              backgroundColor: $fabPosition === 'left' ? '#34C759' : '#e0e0e0',
              color: $fabPosition === 'left' ? '#fff' : '#333',
            },
          ]}
        >
          靠左
        </ThemedText>
        <ThemedText
          onPress={() => set$fabPosition('right')}
          style={[
            styles.positionButton,
            {
              backgroundColor: $fabPosition === 'right' ? '#34C759' : '#e0e0e0',
              color: $fabPosition === 'right' ? '#fff' : '#333',
            },
          ]}
        >
          靠右
        </ThemedText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  positionButton: {
    borderRadius: 6,
    fontSize: 14,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  settingControl: {
    flexDirection: 'row',
    flexShrink: 0,
    gap: 12,
  },
  settingLabel: {
    flex: 1,
    marginRight: 12,
    minWidth: 0,
  },
  settingRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
})
