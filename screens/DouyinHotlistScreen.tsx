import jsCode from '@/components/douyin/hotlist_inject'
import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'

export default function DouyinHotlistScreen() {
  return (
    <WebView
      name={TabsName.douyin_hotlist}
      url={getTabUrl(TabsName.douyin_hotlist)!}
      js={jsCode}
      css={`
        x-view[data-index='0'] {
          display: none !important;
        }
      `}
    />
  )
}
