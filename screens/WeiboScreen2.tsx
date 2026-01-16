import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'

export default function WeiboScreen2() {
  return (
    <WebView
      name={TabsName.weibo2}
      url={getTabUrl(TabsName.weibo2)!}
    />
  )
}
