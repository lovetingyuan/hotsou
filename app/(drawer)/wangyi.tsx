import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'

function __$inject() {
  if (location.pathname.includes('newsapp/hot-content/')) {
    history.scrollRestoration = 'auto'
    const tabsConfig = [
      {
        name: '热议榜',
        version: 'tieFirstTab',
        type: 'TieHotrank',
        callbackFunName: 'loadTieHotData',
        isExcute: !1,
      },
      {
        name: '热闻榜',
        version: 'hotFirstTab',
        type: 'AllHotrank',
        callbackFunName: 'loadAllHotData',
        isExcute: !1,
      },
      {
        name: '热搜榜',
        version: 'searchFirstTab',
        type: 'HotSearch',
        callbackFunName: 'loadHotSearch',
        isExcute: !1,
      },
      {
        name: '视频榜',
        version: 'videoFirstTab',
        type: 'VideoRank',
        callbackFunName: 'loadVideoRank',
        isExcute: !1,
      },
      {
        name: '话题榜',
        version: 'topicFirstTab',
        type: 'TopicRank',
        callbackFunName: 'loadTopicRank',
        isExcute: !1,
      },
    ]
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
    // @ts-ignore
    // window.__keepScrollPosition?.('.swiper-slide-active .rank-container')

    const tabs = document.getElementById('tabContainer')
    if (tabs) {
      const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const active = tabs.querySelector('.active')
            if (active) {
              // @ts-ignore
              const tabName = active.innerText
              const version = tabsConfig.find(v => v.name === tabName)?.version
              if (version) {
                history.replaceState(
                  {},
                  '',
                  location.pathname + '?version=' + version + '&__main_page'
                )
              }
            }
            break
          }
        }
      })

      const config = {
        attributes: true,
        attributeFilter: ['class'],
        subtree: true,
      }

      observer.observe(tabs, config)
    }
  }
}

export default function Wangyi() {
  return (
    <WebView
      name={TabsName.wangyi}
      url={getTabUrl(TabsName.wangyi)!}
      css={`
        .footer-container,
        .js-open-newsapp,
        .fixedOpenNewsapp,
        .openNewsapp,
        .js-bottom-container,
        .logoTop,
        .page-status-error,
        .ad,
        .js-ad,
        .comment-top-ad,
        .js-comment-top-ad {
          display: none !important;
        }
        .hot-container-outapp .rank-container {
          padding: 0 !important;
        }
        // #tabContainer::before {
        //   content: '网易热榜';
        //   display: block;
        //   text-align: center;
        //   font-size: 22px;
        //   line-height: 55px;
        // }
        .g-body-wrap .container {
          top: 0 !important;
        }
        .m-news-list.search-list-wrap {
          margin-top: 25px;
        }
      `}
      js={`(${__$inject})();true;`}
      forbiddenUrls={['sentry.music.163.com', 'm.163.com/newsapp/applinks.html']}
    />
  )
}
