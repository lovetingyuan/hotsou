import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'

function __$inject() {
  // @ts-ignore
  window.__markReaded?.(
    'div[class^="index_content"]',
    'div[class^="index_left_"] > div:first-child',
    'div[class^="index_left_"] > div:first-child'
  )
}

export default function Fenghuang() {
  return (
    <WebView
      name={TabsName.fenghuang}
      url={getTabUrl(TabsName.fenghuang)!}
      js={`(${__$inject})()`}
      css={`
        header,
        div[class^='index_pageBottomBrand'],
        section[class^='index_bottomSlide'],
        div[class^='index_callupBtn'],
        section[class^='index_allLook'],
        section[class^='index_relateVideo'],
        div[class^='index_wrap'],
        div[class^='index_more_box'],
        div[class^='index_toolbar'],
        div[class^='index_videoList'],
        div[class^='index_main_title'],
        div[c] {
          display: none !important;
        }
        section[class^='index_pageBody'] {
          padding-top: 32px;
        }
      `}
      forbiddenUrls={['err.ifengcloud.ifeng.com/v1/api/hb']}
    />
  )
}
