import WebView from '@/components/WebView'
/**
 *  <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no,viewport-fit=cover,minimum-scale=1,maximum-scale=1,user-scalable=no">
 */

function __$inject() {
  if (!document.querySelector('meta[name="viewport"]')) {
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'viewport')
    meta.setAttribute('content', 'width=device-width,viewport-fit=cover')
    //document.head.prepend(meta)
  }
  if (location.pathname.startsWith('/search')) {
    // .xgplayer-page-full-screen
    document.body.style.opacity = '0.01'
    const loader = document.createElement('div')
    loader.style.position = 'fixed'
    loader.style.inset = '0'
    loader.style.pointerEvents = 'none'
    loader.setAttribute('inert', '')
    loader.innerHTML = `
    <div class="loader"></div>
    <style>
      html {
          overflow: hidden;
      }
        .loader {
          width: 120px;
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
        const volumes = document.querySelectorAll(
          '.xgplayer-volume[data-state="mute"] .xgplayer-icon'
        )
        volumes.forEach(v => {
          // @ts-ignore
          v.click()
        })
        document.querySelectorAll('video').forEach(v => {
          v.muted = false
        })
        setTimeout(() => {
          document.body.style.opacity = '1'
          loader.remove()
        }, 1000)
      }
    }, 200)

    setInterval(() => {
      const close = document.querySelector('.related-video-card-login-guide__footer-close')
      if (close) {
        // clearInterval(timer2)
        // @ts-ignore
        close.click()
      }
      document.title = decodeURIComponent(location.pathname.split('/')[2]) + ' - 抖音'
    }, 200)
  }
  if (location.pathname === '/share/billboard') {
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
            const url = 'https://www.douyin.com/search/' + titleText
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
}

export default function Douyin() {
  return (
    <WebView
      url={'https://www.douyin.com/share/billboard'}
      js={`(${__$inject})()`}
      css={`
        html,
        body {
          background: white;
        }
        .body-content > .header,
        .body-content > .hot-title .banner-block {
          display: none !important;
        }
        #video-info-wrap {
          zoom: 2.6;
          position: absolute;
          left: 0;
          bottom: 20px;
        }
        xg-inner-controls {
          zoom: 2.6;
        }
        .hot-list {
          filter: invert(100%) hue-rotate(180deg);
          background: #000000;
        }
        .word .label {
          filter: invert(100%) hue-rotate(180deg) contrast(100%);
        }
        #sliderVideo {
          display: flex;
        }
        #sliderVideo .playerContainer {
          flex-shrink: 1;
        }
        .ZTBYOIeC.CG9pTqjv .UsWJJZhB.Kk4V1N2A.playerContainer {
          width: calc(100% - 60vw);
        }
        #videoSideCard {
          zoom: 2.6;
        }
        xg-start {
          zoom: 3;
        }
        .ZTBYOIeC.CG9pTqjv .JOT0FK4T.I1t22JqH.videoSideCard {
          width: 60vw;
        }
        [id^='login-full-panel'],
        .QSoEc32i,
        .pGZF8lyn,
        div#searchSideCard,
        .comment-input-container {
          display: none !important;
        }
        .LinkSeatsLayout,
        .LinkSeatsLayout + a {
          display: none !important;
        }
      `}
      // forbiddenUrls={['activity.baidu.com/mbox', 'wappass.baidu.com']}
    ></WebView>
  )
}
