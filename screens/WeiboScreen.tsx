import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'

function __$inject() {
  if (location.pathname.startsWith('/top/summary')) {
    // @ts-ignore
    window.__markReaded?.('.list_a li', '.list_a li a span', '.list_a li a span')
  }
  const removeIframes = () => {
    document.querySelectorAll('iframe').forEach((el) => el.remove())
  }
  removeIframes()
  const observer = new MutationObserver(removeIframes)
  observer.observe(document.body, { childList: true, subtree: true })
}

export default function WeiboScreen() {
  return (
    <WebView
      name={TabsName.weibo}
      url={getTabUrl(TabsName.weibo)!}
      css={`
        iframe {
          display: none !important;
        }
        .m-nav,
        .list .title,
        .list_a li:first-child,
        .list_a li:has(.icon_recommend),
        .list_a li:has(strong[style]) {
          display: none !important;
        }
        .list_a li a span {
          font-size: 16px !important;
        }
        div:has(> .bar-bottom-wrap) {
          display: none;
        }
      `}
      js={`(${__$inject})()`}
    />
  )
}
