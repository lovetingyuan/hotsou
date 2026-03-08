import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'

function __$inject() {
  if (location.pathname === '/blackboard/activity-trending-topic.html') {
    // @ts-ignore
    window.__markRead?.('bili-open-app[schema]', '.trending-title', '.trending-title')
    document.addEventListener('click', (e) => {
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
    // @ts-ignore
    window.__keepScrollPosition('', 0, '.trending-container')
  } else if (location.pathname === '/search/') {
    document.addEventListener(
      'click',
      (e) => {
        // @ts-ignore
        const item = e.target.closest('.wx-tag.v-card-single[data-aid]')
        if (item) {
          e.preventDefault()
          const url = 'https://player.bilibili.com/player.html?aid=' + item.dataset.aid
          location.href = url
        }
      },
      true,
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
        bili-open-app:has(.rank-top),
        .v-dialog {
          display: none !important;
        }
      `}
      forbiddenUrls={['data.bilibili.com']}
    />
  )
}
