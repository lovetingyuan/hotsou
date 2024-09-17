import cssCode from '@/components/modules/douyin/css'
import jsCode from '@/components/modules/douyin/inject'
import WebView from '@/components/WebView'
import { TabsName } from '@/constants/Tabs'

export default function Douyin() {
  return (
    <WebView
      name={TabsName.douyin}
      url={'https://www.douyin.com/share/billboard?__main_page'}
      js={jsCode}
      css={cssCode}
      forbiddenUrls={['z.douyin.com', 'zijieapi.com']}
    />
  )
}
