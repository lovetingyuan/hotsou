import cssCode from '@/components/douyin/css'
import jsCode from '@/components/douyin/inject'
import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'

export default function Douyin() {
  return (
    <WebView
      name={TabsName.douyin}
      url={getTabUrl(TabsName.douyin)!}
      js={jsCode}
      css={cssCode}
      forbiddenUrls={['z.douyin.com', 'zijieapi.com', '/log-sdk/collect/']}
    />
  )
}
