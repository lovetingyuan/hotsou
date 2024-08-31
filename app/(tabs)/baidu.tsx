import WebView from '@/components/WebView'

function __$inject() {
  history.scrollRestoration = 'auto'

  document.body.addEventListener(
    'click',
    evt => {
      // @ts-ignore
      const itemElement = evt.target.closest('.row-start-center')
      if (itemElement) {
        const title = itemElement.querySelectorAll('div')[1]
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
    const items = document.querySelectorAll('.row-start-center span')
    items.forEach(ele => {
      // @ts-ignore
      if (ele.innerText in clicked) {
        // @ts-ignore
        ele.style.opacity = 0.5
      }
    })
  }, 200)
}

export default function Baidu() {
  return (
    <WebView
      url={'https://top.baidu.com/board?tab=realtime'}
      js={`(${__$inject})()`}
      css={`
        #bdrainrwDragButton {
          display: none !important;
        }
      `}
    ></WebView>
  )
}
