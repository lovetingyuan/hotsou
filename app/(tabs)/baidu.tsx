import WebView from '@/components/WebView'
import { TabsName } from '@/constants/Tabs'

function __$inject() {
  if (location.hostname !== 'top.baidu.com') {
    return
  }
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
      name={TabsName.baidu}
      url={'https://top.baidu.com/board?tab=realtime'}
      js={`(${__$inject})()`}
      css={`
        #bdrainrwDragButton,
        #page-copyright {
          display: none !important;
        }
        .row-start-center:has(img[src*='redtop']) {
          display: none;
        }
        #page-ft {
          margin-bottom: 20px;
        }
      `}
      forbiddenUrls={['activity.baidu.com/mbox', 'wappass.baidu.com']}
    ></WebView>
  )
}
