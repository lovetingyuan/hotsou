import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'

function __$inject() {
  if (location.pathname === '/ranking') {
    // @ts-ignore
    window.__markReaded?.(
      '[dt-eid="em_item_article"]',
      '[class^="ranking-item_text"]',
      '[dt-eid="em_item_article"] [class^="ranking-item_text"]'
    )

    document.addEventListener(
      'click',
      evt => {
        // @ts-ignore
        if (evt.target.closest('[dt-eid="em_item_article"]')) {
          // @ts-ignore
          localStorage.setItem('scroll-position', document.documentElement.scrollTop)
        }
      },
      true
    )
    const id = localStorage.getItem('scroll-position')
    if (id) {
      const timer = setInterval(() => {
        const nodes = document.querySelectorAll('[dt-eid="em_item_article"]')
        if (nodes.length > 20) {
          clearInterval(timer)
          window.scrollTo({
            top: Number(id),
          })
        }
      }, 200)
      localStorage.removeItem('scroll-position')
    }
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
