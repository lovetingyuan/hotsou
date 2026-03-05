import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'

export default function IthomeScreen() {
  return (
    <WebView
      name={TabsName.ithome}
      url={getTabUrl(TabsName.ithome)!}
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
