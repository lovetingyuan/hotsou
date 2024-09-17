import WebView from '@/components/WebView'
import { TabsName } from '@/constants/Tabs'

function __$inject() {
  if (location.pathname.startsWith('/p/106003')) {
    history.scrollRestoration = 'auto'
    document.body.addEventListener(
      'click',
      evt => {
        // @ts-ignore
        const itemElement = evt.target.closest('div[callback]')
        if (itemElement) {
          const title = itemElement.querySelector('.main-text')
          if (title) {
            const clicked = JSON.parse(localStorage.getItem('__clicked__') || '{}')
            const titleText = title.innerText
            const now = Date.now()
            clicked[titleText] = now
            for (const t in clicked) {
              if (now - clicked[t] > 3 * 24 * 60 * 60 * 1000) {
                delete clicked[t]
              }
            }
            localStorage.setItem('__clicked__', JSON.stringify(clicked))
          }
        }
      },
      true
    )
    setInterval(() => {
      const clicked = JSON.parse(localStorage.getItem('__clicked__') || '{}')
      const items = document.querySelectorAll('div[callback] .main-text')
      items.forEach(ele => {
        // @ts-ignore
        if (ele.innerText in clicked) {
          // @ts-ignore
          ele.style.opacity = 0.5
        }
      })
    }, 200)
  }
  // if (location.pathname.startsWith('/search')) {
  //   const timer = setInterval(() => {
  //     const container = document.querySelector('.vjs-control-bar')
  //     const video = document.querySelector('video')

  //     if (container && video && video.src) {
  //       clearInterval(timer)
  //       const link = document.createElement('a')
  //       link.textContent = '下载'
  //       link.href = video.src
  //       link.style.color = 'white'
  //       link.setAttribute('download', 'aaa.mp4')
  //       container.appendChild(link)
  //       link.onclick = () => {
  //         window.open(video.src, '_self', '')
  //       }
  //     }
  //   }, 1000)
  // }
}

export default function Weibo() {
  // https://s.weibo.com/top/summary?cate=realtimehot
  return (
    <WebView
      name={TabsName.weibo}
      url={'https://m.weibo.cn/p/106003type=25&t=3&disable_hot=1&filter_type=realtimehot'}
      css={`
        div.card.m-panel.card4:has(img[src*='search_point_orange']) {
          display: none;
        }
        div.card.m-panel.card4:has(img[src*='search_stick']) {
          display: none;
        }
        iframe,
        .main .card .wrap,
        .nav-left,
        .m-tab-bar.m-bar-panel.m-container-max {
          display: none !important;
        }
      `}
      js={`(${__$inject})()`}
      forbiddenUrls={['passport.weibo.com']}
    ></WebView>
  )
}
