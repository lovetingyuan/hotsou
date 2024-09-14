/* eslint-env browser */

function __$inject() {
  // eslint-disable-next-line sonarjs/no-commented-code
  // if (location.pathname.startsWith('/search')) {
  //   // .xgplayer-page-full-screen
  //   document.body.style.opacity = '0.01'
  //   const loader = document.createElement('div')
  //   loader.style.position = 'fixed'
  //   loader.style.inset = '0'
  //   loader.style.pointerEvents = 'none'
  //   loader.setAttribute('inert', '')
  //   loader.innerHTML = `
  //   <div class="loader"></div>
  //   <style>
  //     html {
  //         overflow: hidden;
  //     }
  //       .loader {
  //         width: 120px;
  //         position: fixed;
  //         inset: 0;
  //         --b: 8px;
  //         top: 45%;
  //         margin: 0 auto;
  //         aspect-ratio: 1;
  //         border-radius: 50%;
  //         padding: 1px;
  //         background: conic-gradient(#0000 10%,#f03355) content-box;
  //         -webkit-mask:
  //           repeating-conic-gradient(#0000 0deg,#000 1deg 20deg,#0000 21deg 36deg),
  //           radial-gradient(farthest-side,#0000 calc(100% - var(--b) - 1px),#000 calc(100% - var(--b)));
  //         -webkit-mask-composite: destination-in;
  //                 mask-composite: intersect;
  //         animation:l4 1s infinite steps(10);
  //       }
  //       @keyframes l4 {to{transform: rotate(1turn)}}
  //   </style>
  //   `
  //   document.documentElement.appendChild(loader)
  //   const timer = setInterval(() => {
  //     const fullScreen = document.querySelector('.xgplayer-page-full-screen .xgplayer-icon')
  //     if (fullScreen) {
  //       // @ts-ignore
  //       fullScreen.click()
  //       clearInterval(timer)
  //       const volumes = document.querySelectorAll(
  //         '.xgplayer-volume[data-state="mute"] .xgplayer-icon'
  //       )
  //       volumes.forEach(v => {
  //         // @ts-ignore
  //         v.click()
  //       })
  //       document.querySelectorAll('video').forEach(v => {
  //         v.muted = false
  //       })
  //       setTimeout(() => {
  //         document.body.style.opacity = '1'
  //         loader.remove()
  //       }, 1000)
  //     }
  //   }, 200)
  //   setInterval(() => {
  //     const close = document.querySelector('.related-video-card-login-guide__footer-close')
  //     if (close) {
  //       // clearInterval(timer2)
  //       // @ts-ignore
  //       close.click()
  //     }
  //     document.title = decodeURIComponent(location.pathname.split('/')[2]) + ' - 抖音'
  //   }, 200)
  // }
  if (location.pathname === '/share/billboard') {
    history.scrollRestoration = 'auto'
    const searchByKeyword = word => {
      return fetch(
        `https://www.douyin.com/aweme/v1/web/general/search/single/?device_platform=webapp&aid=6383&channel=channel_pc_web&search_channel=aweme_general&enable_history=1&keyword=${encodeURIComponent(
          word
        )}&search_source=normal_search&query_correct_type=1&is_filter_search=0&from_group_id=&offset=0&count=20&need_filter_settings=1&list_type=single&pc_client_type=1&cookie_enabled=true`,
        {
          headers: {
            accept: 'application/json, text/plain, */*',
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
            'cache-control': 'no-cache',
          },
        }
      )
        .then(r => r.json())
        .then(r => {
          // @ts-ignore
          const allIds = r.data
            .filter(v => v.type === 1 && v.aweme_info)
            .sort((a, b) => {
              return (
                b.aweme_info.statistics.comment_count +
                b.aweme_info.statistics.digg_count -
                a.aweme_info.statistics.comment_count -
                a.aweme_info.statistics.digg_count
              )
            })
            .map(v => v.provider_doc_id_str)
          return allIds
        })
    }
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
            let loading
            if (!title.querySelector('.loader')) {
              loading = document.createElement('div')
              loading.className = 'loader'
              title.appendChild(loading)
            }
            searchByKeyword(titleText).then(ids => {
              let url = 'https://www.douyin.com/search/' + titleText
              if (ids && ids.length) {
                url = `https://m.douyin.com/share/video/${ids[0]}#${ids}`
              }
              location.href = url
            })
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
        if (ele.innerText in clicked) {
          ele.style.opacity = 0.5
        }
      })
    }, 200)
  }
  if (location.pathname.startsWith('/share/video/')) {
    let startY
    const threshold = 100 // 滑动阈值，单位为像素
    const switchVideo = direction => {
      const ids = location.hash.slice(1).split(',')
      const id = location.pathname.split('/').pop()
      const index = ids.indexOf(id)
      if (direction === 'up') {
        if (index === ids.length - 1) {
          alert('暂无下一个')
        } else if (index !== -1) {
          const nid = ids[index + 1]
          location.href = location.origin + '/share/video/' + nid + location.hash
        }
      } else if (index === 0) {
        alert('暂无上一个')
      } else if (index !== -1) {
        const nid = ids[index - 1]
        location.href = location.origin + '/share/video/' + nid + location.hash
      }
    }

    document.addEventListener(
      'touchstart',
      e => {
        startY = e.touches[0].clientY
      },
      false
    )

    document.addEventListener(
      'touchend',
      e => {
        if (!startY) {
          return
        }

        const endY = e.changedTouches[0].clientY
        const deltaY = endY - startY

        if (Math.abs(deltaY) > threshold) {
          switchVideo(deltaY > 0 ? 'down' : 'up')
        }

        startY = null // 重置起始位置
      },
      false
    )
    const download = document.createElement('div')
    download.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
        <defs>
          <filter id="shadow">
            <feDropShadow dx="0" dy="1" stdDeviation="0.5" flood-color="black" flood-opacity="0.3"/>
          </filter>
        </defs>
        <path d="M20 5v21.67m-8.33-8.34L20 26.67l8.33-8.34M10 31.67h20" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#shadow)"/>
        <path d="M20 5v21.67m-8.33-8.34L20 26.67l8.33-8.34M10 31.67h20" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>
    `
    download.id = 'download-video'
    download.style.opacity = '0.9'
    download.style.textAlign = 'center'
    download.style.fontSize = '0'
    if (!document.getElementById(download.id)) {
      document.querySelector('.right-con')?.appendChild(download)
      download.addEventListener('click', () => {
        const video = document.getElementById('video-player')
        if (video && video.src) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              type: 'download-douyin-video',
              payload: {
                url: video.src,
              },
            })
          )
        } else {
          alert('暂无资源')
        }
      })
    }
    document.addEventListener(
      'click',
      evt => {
        if (evt.target.closest('.avatar-container')) {
          try {
            const id =
              window._ROUTER_DATA.loaderData['video_(id)/page'].videoInfoRes.item_list[0].author
                .sec_uid
            location.href = 'https://m.douyin.com/share/user/' + id
          } catch (e) {
            Object(e)
          }
        }
      },
      true
    )
  }
}
const jsCode = `(${__$inject})()`
export default jsCode
