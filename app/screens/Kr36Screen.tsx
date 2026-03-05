import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'

export default function Kr36Screen() {
  return (
    <WebView
      name={TabsName.kr36}
      url={getTabUrl(TabsName.kr36)!}
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
