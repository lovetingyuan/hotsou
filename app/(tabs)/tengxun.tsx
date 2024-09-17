import WebView from '@/components/WebView'
import { TabsName } from '@/constants/Tabs'

function __$inject() {
  if (location.pathname === '/ranking') {
    // history.scrollRestoration = 'auto'
    // @ts-ignore
    window.__markReaded?.(
      '[dt-eid="em_item_article"]',
      '[class^="ranking-item_text"]',
      '[dt-eid="em_item_article"] [class^="ranking-item_text"]'
    )
    // @ts-ignore
    window.__keepScrollPosition?.()
  }
}

export default function Tengxun() {
  return (
    <WebView
      name={TabsName.tengxun}
      url="https://view.inews.qq.com/ranking?rankingtabtype=1&__main_page"
      js={`(${__$inject})()`}
      css={`
        div[class*='downloader-floating-bar'],
        div[class*='bottom-bar_buttonWrap'],
        [dt-eid='em_pull_news'],
        div[dt-eid]:has(img[src*='ranking-top.png']) {
          display: none !important;
        }
      `}
      forbiddenUrls={[
        'h.trace.qq.com',
        'otheve.beacon.qq.com',
        'snowflake.qq.com',
        'view.inews.qq.com/mobile',
      ]}
    />
  )
}
