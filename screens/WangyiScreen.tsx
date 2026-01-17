import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'

function __$inject() {
  // rank-container hot-search
  if (location.pathname.includes('newsapp/hot-content/')) {
    // history.scrollRestoration = 'auto'
    // const tabsConfig = [
    //   {
    //     name: '热议榜',
    //     version: 'tieFirstTab',
    //     type: 'TieHotrank',
    //     callbackFunName: 'loadTieHotData',
    //     isExcute: !1,
    //   },
    //   {
    //     name: '热闻榜',
    //     version: 'hotFirstTab',
    //     type: 'AllHotrank',
    //     callbackFunName: 'loadAllHotData',
    //     isExcute: !1,
    //   },
    //   {
    //     name: '热搜榜',
    //     version: 'searchFirstTab',
    //     type: 'HotSearch',
    //     callbackFunName: 'loadHotSearch',
    //     isExcute: !1,
    //   },
    //   {
    //     name: '视频榜',
    //     version: 'videoFirstTab',
    //     type: 'VideoRank',
    //     callbackFunName: 'loadVideoRank',
    //     isExcute: !1,
    //   },
    //   {
    //     name: '话题榜',
    //     version: 'topicFirstTab',
    //     type: 'TopicRank',
    //     callbackFunName: 'loadTopicRank',
    //     isExcute: !1,
    //   },
    // ]
    setInterval(() => {
      const reload = document.querySelector('.page-status-error .page-reload')
      if (reload) {
        // @ts-ignore
        reload.click()
      }
    }, 200)

    // @ts-ignore
    window.__markReaded?.('.s-item-wrapper', '.s-text', '.s-item-wrapper .s-text', (evt, title) => {
      const text = title?.innerText
      if (text) {
        const url = 'https://c.m.163.com/news/search?keyword=' + encodeURIComponent(text)
        location.href = url
        evt.stopPropagation()
        evt.preventDefault()
      }
    })

    // const tabs = document.getElementById('tabContainer')
    // if (tabs) {
    //   const observer = new MutationObserver(mutations => {
    //     for (const mutation of mutations) {
    //       if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
    //         const active = tabs.querySelector('.active')
    //         if (active) {
    //           // @ts-ignore
    //           const tabName = active.innerText
    //           const version = tabsConfig.find(v => v.name === tabName)?.version
    //           if (version) {
    //             history.replaceState(
    //               {},
    //               '',
    //               location.pathname + '?version=' + version + '&__main_page'
    //             )
    //           }
    //         }
    //         break
    //       }
    //     }
    //   })

    //   const config = {
    //     attributes: true,
    //     attributeFilter: ['class'],
    //     subtree: true,
    //   }

    //   observer.observe(tabs, config)
    // }

    document.addEventListener(
      'click',
      evt => {
        // @ts-ignore
        if (evt.target.closest('.s-item-wrapper')) {
          // @ts-ignore
          localStorage.setItem(
            'scroll-position',
            // @ts-ignore
            document.querySelector('.swiper-slide-active .rank-container').scrollTop
          )
        }
      },
      true
    )
    const id = localStorage.getItem('scroll-position')
    if (id) {
      const timer = setInterval(() => {
        const nodes = document.querySelectorAll('.s-item-wrapper')
        if (nodes.length > 20) {
          clearInterval(timer)
          // @ts-ignore
          document.querySelector('.swiper-slide-active .rank-container').scrollTop = id
        }
      }, 200)
      localStorage.removeItem('scroll-position')
    }
  }
}

export default function WangyiScreen() {
  return (
    <WebView
      name={TabsName.wangyi}
      url={getTabUrl(TabsName.wangyi)!}
      css={`
        .footer-container,
        a.js-open-newsapp,
        .fixedOpenNewsapp,
        .openNewsapp,
        .js-bottom-container,
        .logoTop,
        .page-status-error,
        .ad,
        .js-ad,
        .comment-top-ad,
        [data-stat='o-motif-footer'],
        .js-comment-top-ad,
        .open-app-btn,
        .endCover-open,
        .comment .logoBottom {
          display: none !important;
        }
        .hot-container-outapp .rank-container {
          padding: 0 !important;
        }

        .g-body-wrap .container {
          top: 0 !important;
        }
        .m-news-list.search-list-wrap {
          margin-top: 25px;
        }
        #tabContainer {
          padding-top: 12px;
        }
      `}
      js={`(${__$inject})();true;`}
      forbiddenUrls={['sentry.music.163.com', 'm.163.com/newsapp/applinks.html']}
    />
  )
}
