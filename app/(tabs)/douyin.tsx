import cssCode from '@/components/modules/douyin/css'
import jsCode from '@/components/modules/douyin/inject'
import WebView from '@/components/WebView'

export default function Douyin() {
  return (
    <WebView
      url={'https://www.douyin.com/share/billboard'}
      js={jsCode}
      css={cssCode}
      forbiddenUrls={['z.douyin.com']}
    ></WebView>
  )
}
