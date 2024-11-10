import WebView from '@/components/WebView'
import { TabsName } from '@/constants/Tabs'
import { useStore } from '@/store'

import { ThemedText } from './ThemedText'
import { ThemedView } from './ThemedView'

export default function CustomPage(props: { name: TabsName }) {
  const { $tabsList } = useStore()
  const tab = $tabsList.find(t => t.name === props.name)
  if (!tab?.url) {
    return (
      <ThemedView style={{ flex: 1, height: 300 }}>
        <ThemedText style={{ color: 'red', textAlign: 'center', marginTop: 100 }}>
          URL配置错误
        </ThemedText>
        <ThemedText style={{ textAlign: 'center', marginTop: 30 }}>
          请前往“关于”中设置或修改链接地址
        </ThemedText>
      </ThemedView>
    )
  }
  return <WebView name={props.name} url={tab.url} />
}
