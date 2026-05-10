import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'
import { getToutiaoSearchRewriteUrl } from '@/utils/toutiaoSearch'

function __$inject() {
  const getDesktopSearchUrl = () => {
    try {
      const url = new URL(location.href)
      if (url.hostname !== 'so.toutiao.com' || url.pathname !== '/search') {
        return null
      }
      const keyword = url.searchParams.get('keyword')?.trim()
      if (!keyword || url.searchParams.get('dvpf') === 'pc') {
        return null
      }
      const rewriteUrl = new URL('https://so.toutiao.com/search')
      rewriteUrl.searchParams.set('keyword', keyword)
      rewriteUrl.searchParams.set('pd', 'information')
      rewriteUrl.searchParams.set('dvpf', 'pc')
      return rewriteUrl.toString()
    } catch {
      return null
    }
  }

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
    const desktopSearchUrl = getDesktopSearchUrl()
    if (desktopSearchUrl) {
      // Mobile Toutiao Search frequently falls into WebView verification/no-result states.
      location.replace(desktopSearchUrl)
      return
    }

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
        @media (max-width: 700px) {
          html,
          body {
            overflow-x: hidden !important;
            min-width: 0 !important;
          }
          #resultTopWrapper,
          #resultTopWrapper .s-result-content,
          #resultTopWrapper [class*='wrap'],
          #resultTopWrapper [class*='logoWrap'],
          #resultTopWrapper [class*='fixWrap'],
          #resultTopWrapper [class*='nav'],
          .main,
          .main.show-side-list,
          .main.hide-side-list {
            width: 100vw !important;
            min-width: 0 !important;
          }
          #resultTopWrapper [class*='logoWrap'] {
            display: flex !important;
            align-items: center !important;
            box-sizing: border-box !important;
            padding: 10px 12px 0 !important;
          }
          #resultTopWrapper a[class*='logo'],
          #resultTopWrapper [class*='toutiao'] {
            display: none !important;
          }
          #resultTopWrapper [class*='input_wrap'],
          #resultTopWrapper [class*='searchWrap'] {
            position: static !important;
            flex: 1 1 auto !important;
            width: calc(100vw - 24px) !important;
            max-width: none !important;
            margin: 0 !important;
            transform: none !important;
          }
          #resultTopWrapper [class*='input_box'] {
            width: calc(100% - 48px) !important;
          }
          #resultTopWrapper input {
            width: 100% !important;
            font-size: 16px !important;
          }
          #resultTopWrapper [class*='search_'] {
            right: 0 !important;
          }
          #resultTopWrapper [class*='nav'] {
            overflow-x: auto !important;
            box-sizing: border-box !important;
            padding-left: 12px !important;
          }
          #resultTopWrapper [class*='nav'] > div {
            margin-left: 0 !important;
            transform: none !important;
          }
          #resultTopWrapper [class*='nav'] a {
            width: auto !important;
            min-width: 28px !important;
            margin-right: 22px !important;
            white-space: nowrap !important;
          }
          #resultTopWrapper [class*='nav'] a:nth-last-child(-n + 3) {
            min-width: 42px !important;
          }
          .s-result-list {
            float: none !important;
            box-sizing: border-box !important;
            width: 100vw !important;
            margin: 0 !important;
            padding: 10px 14px 24px !important;
          }
          .result-content {
            box-sizing: border-box !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 14px 0 !important;
          }
          .result-content a {
            word-break: break-word !important;
          }
          img {
            max-width: 100% !important;
          }
        }
      `}
      forbiddenUrls={['zijieapi.com', 'article.zlink.toutiao.com']}
      rewriteUrl={getToutiaoSearchRewriteUrl}
    />
  )
}
