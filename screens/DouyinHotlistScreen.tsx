import WebView from '@/components/WebView'
import jsCode from '@/components/douyin/hotlist_inject'
import { getTabUrl, TabsName } from '@/constants/Tabs'

export default function DouyinHotlistScreen() {
  return (
    <WebView
      name={TabsName.douyin_hotlist}
      url={getTabUrl(TabsName.douyin_hotlist)!}
      js={jsCode}
    />
  )
}
