import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'

function __$inject() {
  if (location.pathname === '/rankm/') {
    history.scrollRestoration = 'auto'
    // @ts-ignore
    window.__markReaded(
      '.placeholder.one-img-plc',
      '.plc-title',
      '.placeholder.one-img-plc .plc-title',
    )
    // @ts-ignore
    window.__keepScrollPosition('', 0, 1000)
  }
}

export default function IthomeScreen() {
  return (
    <WebView
      name={TabsName.ithome}
      url={getTabUrl(TabsName.ithome)!}
      js={`(${__$inject})()`}
      css={`
        .open-app-banner,
        .open-app-a,
        iframe,
        .open-app {
          display: none !important;
        }
      `}
    />
  )
}
