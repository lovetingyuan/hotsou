import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'

function __$inject() {
  // @ts-ignore
  window.__markReaded?.(
    '.list_template > [data-cbid]',
    '.list_row_txt',
    '.list_template > [data-cbid] .list_row_txt'
  )
}

export default function Xinlang() {
  return (
    <WebView
      name={TabsName.xinlang}
      url={getTabUrl(TabsName.xinlang)!}
      js={`(${__$inject})();true;`}
      css={`
        .callup-component,
        .call_up_banner,
        #float-btn,
        #faiz_top_banner_swiper,
        .sina_sliders_pos,
        [sax-type='proxy'],
        [sax-type='sax_5'],
        [sax-type='blogbf'] {
          display: none !important;
        }
      `}
      forbiddenUrls={['beacon.sina.com.cn', 'login.sina.com.cn']}
    />
  )
}
