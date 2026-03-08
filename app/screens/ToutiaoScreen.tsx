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
    const readMore = setInterval(() => {
      const readMoreBtn = document.querySelector('.toggle-button')
      if (readMoreBtn) {
        clearInterval(readMore)
        // @ts-ignore
        readMoreBtn.click()
      }
    }, 100)
  }
  if (location.pathname === '/feoffline/hotspot_and_local/html/hot_list/index.html') {
    // @ts-ignore
    window.__keepScrollPosition()
  }
  if (location.pathname === '/search') {
    const reload = () => {
      const results = document.getElementById('results')
      if (results && results.textContent.includes('未找到相关结果')) {
        clearInterval(timer)
        location.reload()
      }
    }
    const timer = setInterval(reload, 100)
    setTimeout(() => {
      clearInterval(timer)
    }, 5000)
  }
}

export default function ToutiaoScreen() {
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
        .arco-masking,
        .l-paragraph-expand {
          display: none !important;
        }
        .hot-list-footer {
          padding: 24px 0 !important;
        }
        .weitoutiao-paragraph {
          max-height: none !important;
        }
      `}
      forbiddenUrls={['zijieapi.com', 'article.zlink.toutiao.com']}
    />
  )
}
