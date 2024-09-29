import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'

function __$inject() {
  if (location.pathname.startsWith('/p/106003')) {
    history.scrollRestoration = 'auto'
    // @ts-ignore
    window.__markReaded?.('div[callback]', '.main-text', 'div[callback] .main-text')
    // @ts-ignore
    // window.__keepScrollPosition?.()
  }
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting && entry.target.tagName === 'VIDEO') {
          // @ts-ignore
          entry.target.pause()
        }
      })
    },
    {
      root: null,
      threshold: 0,
    }
  )

  window.addEventListener(
    'loadstart',
    e => {
      // @ts-ignore
      if (!e.target.id && e.target.tagName === 'VIDEO' && e.target.src) {
        // @ts-ignore
        e.target.muted = false
        // @ts-ignore
        e.target.setAttribute('controls', '')
        // @ts-ignore
        if (!e.target.dataset.observed) {
          // @ts-ignore
          e.target.dataset.observed = 'true'
          // @ts-ignore
          observer.observe(e.target)
        }
      }
    },
    true
  )
}

export default function Weibo() {
  // https://s.weibo.com/top/summary?cate=realtimehot
  return (
    <WebView
      name={TabsName.weibo}
      url={getTabUrl(TabsName.weibo)!}
      css={`
        div.card.m-panel.card4:has(img[src*='search_point_orange']) {
          display: none;
        }
        div.card.m-panel.card4:has(img[src*='search_stick']) {
          display: none;
        }
        iframe,
        .main .card .wrap,
        .nav-left,
        .m-tab-bar.m-bar-panel.m-container-max {
          display: none !important;
        }
      `}
      js={`(${__$inject})()`}
      forbiddenUrls={['passport.weibo.com', 'm.weibo.cn/feature/applink']}
    />
  )
}
