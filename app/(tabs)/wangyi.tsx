import WebView from '@/components/WebView'
import { TabsName } from '@/constants/Tabs'

function __$inject() {
  if (location.pathname.includes('newsapp/hot-content/')) {
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
    // setInterval(() => {
    //   const reload = document.querySelector('.page-status-error .page-reload')
    //   if (reload) {
    //     // @ts-ignore
    //     reload.click()
    //   }
    // }, 200)
    const handleRankClick = () => {
      document.body.addEventListener(
        'click',
        evt => {
          // @ts-ignore
          const item = evt.target.closest('.s-item-wrapper')
          if (item) {
            const text = item.querySelector('.s-text').textContent.trim()
            const url = 'https://c.m.163.com/news/search?keyword=' + encodeURIComponent(text)
            location.href = url
          }
        },
        true
      )
    }
    if (document.body) {
      handleRankClick()
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        handleRankClick()
      })
    }

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
                history.replaceState({}, '', location.pathname + '?version=' + version)
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
      url="https://wp.m.163.com/163/html/newsapp/hot-content/index.html?version=searchFirstTab"
      css={`
        .footer-container,
        .js-open-newsapp,
        .fixedOpenNewsapp,
        .openNewsapp,
        .js-bottom-container,
        .logoTop {
          display: none !important;
        }
        #tabContainer::before {
          content: '网易热点';
          display: block;
          text-align: center;
          font-size: 22px;
          line-height: 55px;
        }
        .g-body-wrap .container {
          top: 0 !important;
        }
      `}
      js={`(${__$inject})();true;`}
      forbiddenUrls={['sentry.music.163.com', 'm.163.com/newsapp/applinks.html']}
    />
  )
}
