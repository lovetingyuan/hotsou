import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'

function __$inject() {
  if (location.pathname === '/rankm/') {
    // history.scrollRestoration = 'auto'
    // @ts-ignore
    window.__markRead(
      '.placeholder.one-img-plc',
      '.plc-title',
      '.placeholder.one-img-plc .plc-title',
    )
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
