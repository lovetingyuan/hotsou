import WebView from '@/components/WebView'
import { TabsName } from '@/constants/Tabs'
import { useStore } from '@/store'

export default function CustomPage(props: { name: TabsName }) {
  const { $tabsList } = useStore()
  const tab = $tabsList.find(t => t.name === props.name)
  if (!tab?.url) {
    return null
  }
  return <WebView name={props.name} url={tab.url} />
}
