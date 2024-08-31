import WebView from '@/components/WebView'

function __$inject() {
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

export default function Weibo() {
  return (
    <WebView
      url={'https://m.weibo.cn/p/106003type=25&t=3&disable_hot=1&filter_type=realtimehot'}
      css={`
        div.card.m-panel.card4:has(img[src*='point_orange']) {
          display: none;
        }
        iframe,
        .main .card .wrap,
        /* .npage-bg, */
        .nav-left,
        .m-tab-bar.m-bar-panel.m-container-max {
          display: none !important;
        }
      `}
      js={`(${__$inject})()`}
      showReloadButton
    ></WebView>
  )
}
