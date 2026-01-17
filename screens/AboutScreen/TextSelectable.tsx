import { Switch, ToastAndroid } from 'react-native'

import { useStore } from '@/store'

import { ThemedText } from '../../components/ThemedText'
import { ThemedView } from '../../components/ThemedView'

export default function TextSelectable() {
  const { $enableTextSelect, set$enableTextSelect } = useStore()

  return (
    <ThemedView
      style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}
    >
      <ThemedText>长按复制页面内容({$enableTextSelect ? '已允许' : '已禁止'})</ThemedText>
      <Switch
        trackColor={{ false: '#767577', true: '#34C759' }}
        thumbColor={$enableTextSelect ? '#fff' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        value={$enableTextSelect}
        onValueChange={() => {
          set$enableTextSelect(v => !v)
          ToastAndroid.show('刷新后生效', ToastAndroid.SHORT)
        }}
      />
    </ThemedView>
  )
}
