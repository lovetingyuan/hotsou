import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'

function __$inject() {
  setInterval(() => {
    if (location.href.startsWith('https://m.weibo.cn/profile/')) {
      history.replaceState({}, '', location.href.replace('/profile/', '/u/'))
      // @ts-ignore
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'reload',
          payload: {},
        })
      )
    }
  }, 200)
  if (location.pathname.startsWith('/p/106003')) {
    // @ts-ignore
    window.__markReaded?.('div[callback]', '.main-text', 'div[callback] .main-text')
    // @ts-ignore
    window.__keepScrollPosition2?.('.card.m-panel', height => {
      const items = document.querySelectorAll('.card.m-panel')
      if (items.length > 20) {
        window.scrollTo(0, height)
        return true
      }
    })
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

export default function WeiboScreen() {
  return (
    <WebView
      name={TabsName.weibo}
      url={getTabUrl(TabsName.weibo)!}
      css={`
        div:has(> .m-top-bar),
        h2.card-title,
        div.card.m-panel.card4:has(img[src*='search_point_orange']),
        div.card.m-panel.card4:has(img[src*='search_stick']),
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
