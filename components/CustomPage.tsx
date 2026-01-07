import { useNavigation } from '@react-navigation/native'

import WebView from '@/components/WebView'
import { TabsName } from '@/constants/Tabs'
import { useStore } from '@/store'

import { ThemedText } from './ThemedText'
import { ThemedView } from './ThemedView'

export default function CustomPage(props: { name: TabsName }) {
  const { $tabsList } = useStore()
  const navigation = useNavigation()

  const tab = $tabsList.find(t => t.name === props.name)
  if (!tab?.url) {
    return (
      <ThemedView style={{ flex: 1, height: 300 }}>
        <ThemedText style={{ color: '#d73a49', textAlign: 'center', marginTop: 100 }}>
          🔗 页面URL还未配置
        </ThemedText>
        <ThemedText style={{ textAlign: 'center', marginTop: 30 }}>
          💡 请前往{' '}
          <ThemedText
            onPress={() => {
              navigation.navigate('About' as never)
            }}
            style={{ color: '#00af57', fontWeight: 'bold', fontSize: 20 }}
          >
            &ldquo;关于&rdquo;
          </ThemedText>{' '}
          中设置或修改链接地址
        </ThemedText>
      </ThemedView>
    )
  }
  return <WebView name={props.name} url={tab.url} />
}
