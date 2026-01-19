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
  if (location.pathname === '/search') {
    const reload = () => {
      const results = document.getElementById('results')
      if (results && results.textContent.includes('抱歉，未找到相关结果')) {
        location.reload()
      }
    }
    if (document.readyState === 'complete') {
      reload()
    } else {
      window.addEventListener('load', () => {
        reload()
      })
    }
    setTimeout(() => {
      reload()
    }, 800)
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
