/* eslint-env browser */

// injectedJavascript may execute twice
function __$inject() {
  const timeAgo = timestamp => {
    const seconds = Math.floor((new Date() - timestamp * 1000) / 1000)

    const intervals = [
      { label: '年', seconds: 31536000 },
      { label: '个月', seconds: 2592000 },
      { label: '天', seconds: 86400 },
      { label: '小时', seconds: 3600 },
      { label: '分钟', seconds: 60 },
      { label: '秒', seconds: 1 },
    ]

    for (const element of intervals) {
      const interval = element
      const count = Math.floor(seconds / interval.seconds)

      if (count >= 1) {
        if (interval.seconds === 1) {
          return '刚刚'
        } else {
          return count + interval.label + '前'
        }
      }
    }

    return '刚刚'
  }
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
  //
  //       fullScreen.click()
  //       clearInterval(timer)
  //       const volumes = document.querySelectorAll(
  //         '.xgplayer-volume[data-state="mute"] .xgplayer-icon'
  //       )
  //       volumes.forEach(v => {
  //
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
  //
  //       close.click()
  //     }
  //     document.title = decodeURIComponent(location.pathname.split('/')[2]) + ' - 抖音'
  //   }, 200)
  // }
  if (location.pathname === '/share/billboard') {
    history.scrollRestoration = 'auto'
    const searchByKeyword = word => {
      const keyword = encodeURIComponent(word)
      return fetch(
        `https://www.douyin.com/aweme/v1/web/general/search/single/?device_platform=webapp&aid=6383&channel=channel_pc_web&search_channel=aweme_general&enable_history=1&keyword=${keyword}&search_source=hot_search_board&query_correct_type=1&is_filter_search=0&from_group_id=&offset=0&count=20&need_filter_settings=1&list_type=single&pc_client_type=1&cookie_enabled=true`,
        {
          headers: {
            accept: 'application/json, text/plain, */*',
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
            'cache-control': 'no-cache',
          },
          // referrer: 'https://www.douyin.com/search/' + keyword,
          // referrerPolicy: 'strict-origin-when-cross-origin',
          body: null,
          method: 'GET',
          mode: 'cors',
          credentials: 'include',
        }
      )
        .then(r => r.json())
        .then(r => {
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
            const loading = document.createElement('div')
            loading.className = 'loader'
            title.appendChild(loading)
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
    const getVideoComments = () => {
      const id = location.pathname.split('/').pop()
      return fetch(
        `https://www.douyin.com/aweme/v1/web/comment/list/?device_platform=webapp&aid=6383&channel=channel_pc_web&aweme_id=${id}&cursor=0&count=30&item_type=0`,
        {
          headers: {
            accept: 'application/json, text/plain, */*',
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
            'cache-control': 'no-cache',
          },
          // referrer:
          //   `https://www.douyin.com/search/%E6%9E%97%E8%AF%97%E6%A0%8B4%3A1%E6%88%98%E8%83%9C%E7%8E%8B%E6%A5%9A%E9%92%A6%E6%99%8B%E7%BA%A7%E5%86%B3%E8%B5%9B?aid=f0f77743-5caa-4118-8d19-1e665c0e252e&modal_id=7414503773986508042&type=general`,
          // referrerPolicy: 'strict-origin-when-cross-origin',
          body: null,
          method: 'GET',
          mode: 'cors',
          credentials: 'include',
        }
      )
        .then(r => r.json())
        .then(r => {
          const comments = r.comments
            .map(comment => {
              return {
                cid: comment.cid,
                create_time: timeAgo(comment.create_time),
                digg_count: comment.digg_count,
                ip_label: comment.ip_label,
                text: comment.text,
                name: comment.user.nickname,
                reply_count: comment.reply_comment_total,
              }
            })
            .sort((a, b) => {
              return b.digg_count + b.reply_count - a.digg_count - a.reply_count
            })
          return { comments, total: r.total }
        })
    }
    let startY
    const threshold = 100
    const switchVideo = direction => {
      if (document.querySelector('.show-comments-popup')) {
        return
      }
      const ids = location.hash.slice(1).split(',')
      const id = location.pathname.split('/').pop()
      const index = ids.indexOf(id)
      if (direction === 'up') {
        if (index === ids.length - 1) {
          alert('暂无下一个')
        } else if (index !== -1) {
          const nid = ids[index + 1]
          history.replaceState({}, '', '/share/video/' + nid + location.hash)
          location.reload()
        }
      } else if (index === 0) {
        alert('暂无上一个')
      } else if (index !== -1) {
        const nid = ids[index - 1]
        history.replaceState({}, '', '/share/video/' + nid + location.hash)
        location.reload()
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

        startY = null
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
    const commentContainer = document.createElement('div')
    commentContainer.innerHTML = `
    <style>
      .comments-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: none;
        z-index: 1000;
      }
      .comments-popup {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 70%;
        background-color: white;
        border-radius: 20px 20px 0 0;
        transform: translateY(100%);
        transition: transform 0.2s ease-out;
        z-index: 1001;
      }
      .comment-popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        user-select: none;
        background-color: white;
        position: sticky;
        top: 0;
        padding: 15px 0 10px 0;
      }
      .comments-popup-content {
        font-size: 16px;
        padding: 0 20px 10px 20px;
        overflow-y: auto;
        height: 100%;
      }
      .show-comments-popup {
        display: block;
      }
      .slide-up-comments-popup {
        transform: translateY(0);
      }
      #comment-popup-title {
        font-size: 18px;
      }
      #comment-popup-close {
        padding: 10px;
      }
      #comment-popup-body::after {
        content: "只显示前30条";
        display: block;
        text-align: center;
        font-size: 14px;
        color: gray;
        font-weight: 300;
      }
      .comment-item { border-bottom: 1px solid #eee; margin: 20px 0;padding-bottom: 12px;}
      .comment-header { margin-bottom: 10px; display: flex; justify-content: space-between;}
      .comment-user-name { font-weight: bold; }
      .comment-user-ip { color: gray; margin-left: 12px; font-size: 13px; }
      .comment-user-ip::before { content: '@'; font-size: 14px;}
      .comment-body {line-height: 24px; margin-left: 10px;}
      .comment-like { font-size: 13px; color: #ee6f00; font-weight: 300; }
      .comment-like::before {content: '👍'; margin-left: 18px; font-size: 14px;}
      .comment-time { font-style: italic; color: gray; font-size: 13px; font-weight: 300; }
    </style>
    <div class="comments-overlay" id="comments-overlay">
      <div class="comments-popup" id="comments-popup">
        <div class="comments-popup-content">
          <div class="comment-popup-header">
            <h2 id="comment-popup-title"></h2>
            <div id="comment-popup-close">✕</div>
          </div>
          <div id="comment-popup-body">
            <template id="comment-item-template">
              <div class="comment-item">
                <div class="comment-header">
                  <span>
                    <span class="comment-user-name"></span>
                    <span class="comment-user-ip"></span>
                  </span>
                  <span class="comment-time"></span>
                </div>
                <div class="comment-body">
                  <span class="comment-body-text"></span>
                  <span class="comment-like"></span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
    `
    document.body.appendChild(commentContainer)
    const overlay = document.getElementById('comments-overlay')
    const popup = document.getElementById('comments-popup')
    const commentItemTemplate = document.getElementById('comment-item-template')
    const close = document.getElementById('comment-popup-close')
    const openPopup = () => {
      overlay.classList.add('show-comments-popup')
      setTimeout(() => {
        popup.classList.add('slide-up-comments-popup')
      }, 10)
    }

    const closePopup = () => {
      popup.classList.remove('slide-up-comments-popup')
      setTimeout(() => {
        overlay.classList.remove('show-comments-popup')
      }, 300)
    }

    overlay.addEventListener('click', event => {
      if (event.target === overlay) {
        closePopup()
      }
    })
    close.addEventListener('click', () => {
      closePopup()
    })
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
        if (evt.target.tagName === 'IMG' && evt.target.className === 'comments') {
          getVideoComments().then(({ comments, total }) => {
            // console.log(comments)
            openPopup()
            document.getElementById('comment-popup-title').textContent = `评论(${total}条)`
            const fragment = document.createDocumentFragment()

            comments.forEach(comment => {
              const commentItem = commentItemTemplate.content.cloneNode(true)
              commentItem.querySelector('.comment-item').dataset.cid = comment.cid
              commentItem.querySelector('.comment-user-name').textContent = comment.name
              commentItem.querySelector('.comment-user-ip').textContent = comment.ip_label
              commentItem.querySelector('.comment-time').textContent = comment.create_time
              commentItem.querySelector('.comment-body-text').textContent = comment.text
              commentItem.querySelector('.comment-like').textContent = comment.digg_count
              fragment.appendChild(commentItem)
            })
            document.getElementById('comment-popup-body').appendChild(fragment)
          })
        }
      },
      true
    )
  }
}
const jsCode = `(${__$inject})()`
export default jsCode
