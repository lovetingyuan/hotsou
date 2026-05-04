import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'

function __$inject() {
  // const normalizeHotLinks = () => {
  //   const hotLinkSelector = [
  //     'a[href^="/weibo?q="]',
  //     'a[href^="//s.weibo.com/weibo?q="]',
  //     'a[href^="https://s.weibo.com/weibo?q="]',
  //   ].join(',')

  //   document.querySelectorAll<HTMLAnchorElement>(hotLinkSelector).forEach(link => {
  //     link.removeAttribute('target')
  //     if (link.dataset.hotsouCurrentWebview === 'true') {
  //       return
  //     }
  //     link.dataset.hotsouCurrentWebview = 'true'
  //     link.addEventListener(
  //       'click',
  //       event => {
  //         const href = link.getAttribute('href')
  //         if (!href) {
  //           return
  //         }
  //         const url = new URL(href, location.href)
  //         if (url.origin !== 'https://s.weibo.com' || url.pathname !== '/weibo') {
  //           return
  //         }
  //         event.preventDefault()
  //         event.stopImmediatePropagation()
  //         location.assign(url.href)
  //       },
  //       true,
  //     )
  //   })
  // }

  if (location.pathname.startsWith('/top/summary')) {
    // normalizeHotLinks()
    // @ts-ignore
    window.__markRead?.(
      '.list .list_a li',
      // @ts-ignore
      (el) => el.querySelector('a span').firstChild,
      () => {
        const texts = document.querySelectorAll('.list .list_a li a span')
        const result = {}
        texts.forEach((span) => {
          const text = span.firstChild?.textContent
          // @ts-ignore
          result[text] = span
        })
        return result
      },
    )
    // document.body.addEventListener(
    //   'click',
    //   e => {
    //     const link = e.target?.closest('a')
    //     if (link) {
    //       // alert(link.href)
    //       location.href = link.href
    //     }
    //   },
    //   true,
    // )
  }
  // const removeIframes = () => {
  //   document.querySelectorAll('iframe').forEach((el) => el.remove())
  // }
  // removeIframes()
  // const observer = new MutationObserver(removeIframes)
  // const normalizeObserver = new MutationObserver(normalizeHotLinks)
  // observer.observe(document.body, { childList: true, subtree: true })
  // normalizeObserver.observe(document.body, { childList: true, subtree: true })
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
