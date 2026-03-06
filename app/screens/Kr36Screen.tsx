import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'

function __$inject() {
  if (location.pathname === '/hot-list-m') {
    history.scrollRestoration = 'auto'
    // @ts-ignore
    window.__markReaded('.list-item', '.title', '.list-item .title')
    // @ts-ignore
    window.__keepScrollPosition('', 0, 2000)
  }
}

export default function Kr36Screen() {
  return (
    <WebView
      name={TabsName.kr36}
      url={getTabUrl(TabsName.kr36)!}
      js={`(${__$inject})()`}
      css={`
        .kr-mobile-header,
        .float-app-button-wrp,
        .float-home-button-wrp,
        .article-top-swiper-goapp {
          display: none !important;
        }
      `}
    />
  )
}
