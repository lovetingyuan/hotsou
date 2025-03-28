import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'

function __$inject() {
  if (location.pathname.startsWith('/article/') || location.pathname.startsWith('/video/')) {
    setInterval(() => {
      const cancelBtn = document.querySelector('.activate-modal .button.cancel')
      if (cancelBtn) {
        // @ts-ignore
        cancelBtn.click()
      }
    }, 200)
  }
}

export default function Toutiao() {
  return (
    <WebView
      name={TabsName.toutiao}
      url={getTabUrl(TabsName.toutiao)!}
      js={`(${__$inject})();true;`}
      css={`
        .float-activate-button-container,
        #top-banner-container,
        .arco-show-monitor
          :where(.m-top-container, .m-bottom-container, .m-index-tag, .content-bottom),
        .m-top-padding,
        .m-bottom-bar,
        .m-index-tag,
        .arco-masking {
          display: none !important;
        }
        .hot-list-footer {
          padding: 24px 0 !important;
        }
      `}
      forbiddenUrls={['zijieapi.com', 'artical.zlink.toutiao.com']}
    />
  )
}
