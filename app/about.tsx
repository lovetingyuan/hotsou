import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import * as Application from 'expo-application'

export default function About() {
  return (
    <ThemedView style={{ flex: 1, padding: 20, gap: 20 }}>
      <ThemedText style={{ fontSize: 20 }}>欢迎使用本应用</ThemedText>
      <ThemedText>聚合一些媒体的热搜热点</ThemedText>
      <ThemedText>当前版本：{Application.nativeApplicationVersion}</ThemedText>
    </ThemedView>
  )
}
