import WebView from '@/components/WebView'
/**
 *  <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no,viewport-fit=cover,minimum-scale=1,maximum-scale=1,user-scalable=no">
 */

function __$inject() {
  if (!document.querySelector('meta[name="viewport"]')) {
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'viewport')
    meta.setAttribute('content', 'width=device-width,viewport-fit=cover')
    document.head.prepend(meta)
  }
  if (location.pathname.startsWith('/search')) {
    // .xgplayer-page-full-screen
    document.body.style.opacity = '0.01'
    const loader = document.createElement('div')
    loader.style.position = 'fixed'
    loader.style.inset = '0'
    loader.style.pointerEvents = 'none'
    loader.innerHTML = `
    <div class="loader"></div>
    <style>
        .loader {
          width: 150px;
          position: fixed;
          inset: 0;
          --b: 8px;
          top: 45%;
          margin: 0 auto;
          aspect-ratio: 1;
          border-radius: 50%;
          padding: 1px;
          background: conic-gradient(#0000 10%,#f03355) content-box;
          -webkit-mask:
            repeating-conic-gradient(#0000 0deg,#000 1deg 20deg,#0000 21deg 36deg),
            radial-gradient(farthest-side,#0000 calc(100% - var(--b) - 1px),#000 calc(100% - var(--b)));
          -webkit-mask-composite: destination-in;
                  mask-composite: intersect;
          animation:l4 1s infinite steps(10);
        }
        @keyframes l4 {to{transform: rotate(1turn)}}
    </style>
    `
    document.documentElement.appendChild(loader)
    const timer = setInterval(() => {
      const fullScreen = document.querySelector('.xgplayer-page-full-screen .xgplayer-icon')
      if (fullScreen) {
        // @ts-ignore
        fullScreen.click()
        clearInterval(timer)
        setTimeout(() => {
          document.body.style.opacity = '1'
          loader.remove()
        }, 1000)
      }
    }, 200)
  }
  if (location.pathname !== '/share/billboard') {
    return
  }
  history.scrollRestoration = 'auto'

  document.body.addEventListener(
    'click',
    evt => {
      // @ts-ignore
      const itemElement = evt.target.closest('.list-container .word-item')
      if (itemElement) {
        const title = itemElement.querySelector('.word')
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
          const url = 'https://www.douyin.com/root/search/' + titleText
          location.href = url
          evt.stopPropagation()
          evt.preventDefault()
        }
      }
    },
    true
  )
  setInterval(() => {
    const clicked = JSON.parse(localStorage.getItem('__clicked__') || '{}')
    const items = document.querySelectorAll('.list-container .word-item .word')
    items.forEach(ele => {
      // @ts-ignore
      if (ele.innerText in clicked) {
        // @ts-ignore
        ele.style.opacity = 0.5
      }
    })
  }, 200)
}

export default function Douyin() {
  return (
    <WebView
      url={'https://www.douyin.com/share/billboard'}
      js={`(${__$inject})()`}
      css={`
        .body-content > .header,
        .body-content > .hot-title .banner-block {
          display: none !important;
        }
        #video-info-wrap {
          zoom: 2.5;
          position: absolute;
          left: 0;
          bottom: 20px;
        }
        xg-inner-controls {
          zoom: 2.5;
        }
        // div#videoSideCard {
        //   zoom: 2.5;
        //   position: absolute !important;
        //   width: 100% !important;
        // }
      `}
      // forbiddenUrls={['activity.baidu.com/mbox', 'wappass.baidu.com']}
    ></WebView>
  )
}
