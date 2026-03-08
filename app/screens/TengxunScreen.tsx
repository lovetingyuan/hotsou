import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'

function __$inject() {
  if (location.pathname === '/ranking') {
    // @ts-ignore
    window.__markRead?.(
      '[dt-eid="em_item_article"]',
      '[class^="ranking-item_text"]',
      '[dt-eid="em_item_article"] [class^="ranking-item_text"]',
    )
    // @ts-ignore
    window.__keepScrollPosition('', 0, 'div[class^="ranking-list_"]')
  }
}

export default function TengxunScreen() {
  return (
    <WebView
      name={TabsName.tengxun}
      url={getTabUrl(TabsName.tengxun)!}
      js={`(${__$inject})()`}
      css={`
        div[class*='downloader-floating-bar'],
        div[class*='bottom-bar_buttonWrap'],
        [dt-eid='em_pull_news'],
        div[dt-eid]:has(img[src*='ranking-top.png']),
        [id^='App_WAP_share'] {
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
