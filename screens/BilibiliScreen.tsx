import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'

function __$inject() {
  if (location.pathname === '/blackboard/activity-trending-topic.html') {
    // @ts-ignore
    window.__markReaded?.('bili-open-app[schema]', '.trending-title', '.trending-title')
    document.addEventListener('click', e => {
      // @ts-ignore
      const item = e.target.closest('bili-open-app[schema]')
      if (item) {
        e.preventDefault()
        const word = item.__vue__?.data.keyword
        if (word) {
          const url = 'https://m.bilibili.com/search/?keyword=' + encodeURIComponent(word)
          location.href = url
        }
      } else {
        // @ts-ignore
        const item2 = e.target.closest('m-open-app')
        if (item2) {
          const { pathname } = new URL(item2.getAttribute('schema'))
          location.href = 'https://player.bilibili.com/player.html?aid=' + pathname.split('/').pop()
        }
      }
    })

    document.addEventListener(
      'click',
      evt => {
        // @ts-ignore
        if (evt.target.closest('bili-open-app[schema]')) {
          // @ts-ignore
          localStorage.setItem('scroll-position', document.documentElement.scrollTop)
        }
      },
      true
    )
    const id = localStorage.getItem('scroll-position')
    if (id) {
      const timer = setInterval(() => {
        const nodes = document.querySelectorAll('bili-open-app')
        if (nodes.length > 20) {
          clearInterval(timer)
          window.scrollTo({
            top: Number(id),
          })
        }
      }, 200)
      localStorage.removeItem('scroll-position')
    }
  } else {
    document.documentElement.addEventListener(
      'click',
      e => {
        // @ts-ignore
        const item2 = e.target.closest('m-open-app')
        if (item2) {
          e.preventDefault()
          e.stopPropagation()
          const { pathname } = new URL(item2.getAttribute('schema'))
          const url = 'https://player.bilibili.com/player.html?aid=' + pathname.split('/').pop()
          location.href = url
        }
      },
      true
    )
  }
}

export default function BilibiliScreen() {
  return (
    <WebView
      name={TabsName.bilibili}
      url={getTabUrl(TabsName.bilibili)!}
      js={`(${__$inject})()`}
      css={`
        bili-open-app:has(.rank-top) {
          display: none !important;
        }
      `}
      forbiddenUrls={['data.bilibili.com']}
    />
  )
}
