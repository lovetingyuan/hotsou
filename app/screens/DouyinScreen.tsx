import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'

function __$inject() {
  if (location.pathname === '/landings/hotlist') {
    // @ts-ignore
    window.__markReaded?.(
      'x-view[data-topic]',
      'x-text.hot-item-title-text',
      'x-text.hot-item-title-text'
    )
    // @ts-ignore
    window.__keepScrollPosition('#hot-list-0[enable-scroll', 80)
  }
}
const jsCode = `(${__$inject})()`

export default function DouyinHotlistScreen() {
  return (
    <WebView
      name={TabsName.douyin}
      url={getTabUrl(TabsName.douyin)!}
      js={jsCode}
      css={`
        x-view[data-index]:has(x-image.hot-item-index-top) {
          display: none !important;
        }
        #hot-list-0 {
          padding-bottom: 50px !important;
        }
      `}
    />
  )
}
