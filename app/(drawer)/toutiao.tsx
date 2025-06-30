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
  if (location.pathname === '/feoffline/hotspot_and_local/html/hot_list/index.html') {
    document.addEventListener(
      'click',
      evt => {
        // @ts-ignore
        if (evt.target.closest('.tt-show-monitor')) {
          // @ts-ignore
          localStorage.setItem('scroll-position', document.documentElement.scrollTop)
        }
      },
      true
    )
    const id = localStorage.getItem('scroll-position')
    if (id) {
      const timer = setInterval(() => {
        const nodes = document.querySelectorAll('.tt-show-monitor')
        if (nodes.length > 20) {
          clearInterval(timer)
          window.scrollTo({
            top: Number(id),
          })
        }
      }, 200)
      localStorage.removeItem('scroll-position')
    }
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
