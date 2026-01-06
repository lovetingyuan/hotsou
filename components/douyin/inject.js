/* eslint-env browser */

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

  if (window.location.pathname === '/share/billboard') {
    window.history.scrollRestoration = 'auto'
    // const searchByKeyword = word => {
    //   const keyword = encodeURIComponent(word)
    //   return fetch(
    //     // `https://www.douyin.com/aweme/v1/web/general/search/single/?device_platform=webapp&aid=6383&channel=channel_pc_web&search_channel=aweme_general&enable_history=1&keyword=${keyword}&search_source=hot_search_board&query_correct_type=1&is_filter_search=0&from_group_id=&offset=0&count=20&need_filter_settings=1&list_type=single&pc_client_type=1&cookie_enabled=true`,
    //     // `https://www.douyin.com/aweme/v1/web/general/search/single/?device_platform=webapp&aid=6383&channel=channel_pc_web&search_channel=aweme_video_web&enable_history=1&keyword=${keyword}&search_source=normal_search&query_correct_type=1&is_filter_search=0&from_group_id=&offset=0&count=20&need_filter_settings=1&list_type=single&pc_client_type=1&update_version_code=170400&version_code=190600&version_name=19.6.0`,
    //     `https://www.douyin.com/aweme/v1/web/general/search/single/?device_platform=webapp&aid=6383&channel=channel_pc_web&search_channel=aweme_general&enable_history=1&keyword=${keyword}&search_source=normal_search&query_correct_type=1&is_filter_search=0&from_group_id=&offset=0&count=10&need_filter_settings=1&list_type=single&update_version_code=170400&pc_client_type=1&pc_libra_divert=Windows&version_code=190600&version_name=19.6.0&cookie_enabled=false&screen_width=1384&screen_height=865&browser_language=zh-CN&browser_platform=Win32&browser_name=Edge&browser_version=130.0.0.0&browser_online=true&engine_name=Blink&engine_version=130.0.0.0&os_name=Windows&os_version=10&cpu_core_num=16&device_memory=8&platform=PC&downlink=1.5&effective_type=3g&round_trip_time=550&webid=7412132629645002278`,
    //     {
    //       headers: {
    //         accept: 'application/json, text/plain, */*',
    //         'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    //         'cache-control': 'no-cache',
    //       },
    //       // referrer: 'https://www.douyin.com/search/' + keyword,
    //       // referrerPolicy: 'strict-origin-when-cross-origin',
    //       body: null,
    //       method: 'GET',
    //       mode: 'cors',
    //       credentials: 'include',
    //     }
    //   )
    //     .then(r => r.json())
    //     .then(r => {
    //       const allIds = r.data
    //         .filter(v => v.type === 1 && v.aweme_info)
    //         .sort((a, b) => {
    //           return (
    //             b.aweme_info.statistics.comment_count +
    //             b.aweme_info.statistics.digg_count -
    //             a.aweme_info.statistics.comment_count -
    //             a.aweme_info.statistics.digg_count
    //           )
    //         })
    //         .map(v => v.provider_doc_id_str)
    //       return allIds
    //     })
    // }
    window.__markReaded?.(
      '.list-container .word-item',
      '.word',
      '.list-container .word-item .word',
      (evt, title) => {
        evt.stopPropagation()
        evt.preventDefault()

        if (!window.document.querySelector('.douyin-title-click-loader')) {
          const loading = window.document.createElement('div')
          loading.className = 'douyin-title-click-loader'
          title.appendChild(loading)
          const titleText = title.innerText
          const _hot_list = decodeURIComponent(window.location.hash.split('=')[1] || '')
          if (_hot_list) {
            const hotList = JSON.parse(_hot_list)
            const item = hotList.find(v => v.word === titleText)
            if (item) {
              window.ReactNativeWebView.postMessage(
                JSON.stringify({
                  type: 'douyin-hot-id',
                  payload: item.sentence_id,
                })
              )
              // window.location.href = 'https://www.douyin.com/hot/' + item.sentence_id
            }
          }
          return
        }
        return false
      }
    )
  }

  if (window.location.pathname.startsWith('/share/video/')) {
    const getVideoComments = () => {
      const id = window.location.pathname.split('/').pop()
      return fetch(
        `https://www.douyin.com/aweme/v1/web/comment/list/?device_platform=webapp&aid=6383&channel=channel_pc_web&aweme_id=${id}&cursor=0&count=30&item_type=0`,
        {
          headers: {
            accept: 'application/json, text/plain, */*',
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
            'cache-control': 'no-cache',
          },
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
    // let startY
    // const threshold = 100
    // const switchVideo = direction => {
    //   if (window.document.querySelector('.show-comments-popup')) {
    //     return
    //   }
    //   const ids = window.location.hash.slice(1).split(',')
    //   const id = window.location.pathname.split('/').pop()
    //   const index = ids.indexOf(id)
    //   if (direction === 'up') {
    //     if (index === ids.length - 1) {
    //       alert('暂无下一个')
    //     } else if (index !== -1) {
    //       const nid = ids[index + 1]
    //       window.history.replaceState({}, '', '/share/video/' + nid + window.location.hash)
    //       window.location.reload()
    //     }
    //   } else if (index === 0) {
    //     alert('暂无上一个')
    //   } else if (index !== -1) {
    //     const nid = ids[index - 1]
    //     window.history.replaceState({}, '', '/share/video/' + nid + window.location.hash)
    //     window.location.reload()
    //   }
    // }

    // window.document.addEventListener(
    //   'touchstart',
    //   e => {
    //     startY = e.touches[0].clientY
    //   },
    //   false
    // )

    // window.document.addEventListener(
    //   'touchend',
    //   e => {
    //     if (!startY) {
    //       return
    //     }

    //     const endY = e.changedTouches[0].clientY
    //     const deltaY = endY - startY

    //     if (Math.abs(deltaY) > threshold) {
    //       switchVideo(deltaY > 0 ? 'down' : 'up')
    //     }

    //     startY = null
    //   },
    //   false
    // )
    const download = window.document.createElement('div')
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
    if (!window.document.getElementById(download.id)) {
      window.document.querySelector('.right-con')?.appendChild(download)
      download.addEventListener('click', () => {
        const video = window.document.getElementById('video-player')
        if (video && video.src) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              type: 'download-video',
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
    window.__waitBody(() => {
      const commentContainer = window.document.createElement('div')
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
        .comment-user-name { font-weight: 500; }
        .comment-user-ip { color: gray; margin-left: 12px; font-size: 13px; }
        .comment-user-ip::before { content: '@'; font-size: 14px;}
        .comment-body {line-height: 24px; margin-left: 10px;}
        .comment-body-text { color: #555; }
        .comment-like { font-size: 12px; color: #ee6f00; font-weight: 300; }
        .comment-like::before {content: '👍'; margin-left: 18px; font-size: 14px;}
        .comment-time { color: gray; font-size: 12px; font-weight: 300; }
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
      window.document.body.appendChild(commentContainer)
      const overlay = window.document.getElementById('comments-overlay')
      const popup = window.document.getElementById('comments-popup')
      const commentItemTemplate = window.document.getElementById('comment-item-template')
      const close = window.document.getElementById('comment-popup-close')
      const openPopup = () => {
        window.history.pushState({ popup: 'open' }, 'open popup')
        overlay.classList.add('show-comments-popup')
        window.setTimeout(() => {
          popup.classList.add('slide-up-comments-popup')
        }, 10)
      }

      window.addEventListener('popstate', evt => {
        if (evt.state.popup === 'open' || typeof evt.state.idx === 'number') {
          closePopup(true)
        }
      })

      const closePopup = state => {
        if (!state) {
          window.history.back()
        }
        popup.classList.remove('slide-up-comments-popup')
        window.setTimeout(() => {
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
      window.document.addEventListener(
        'click',
        evt => {
          if (evt.target.closest('.avatar-container')) {
            try {
              const id =
                window._ROUTER_DATA.loaderData['video_(id)/page'].videoInfoRes.item_list[0].author
                  .sec_uid
              window.location.href = 'https://m.douyin.com/share/user/' + id
            } catch (e) {
              Object(e)
            }
          }
          if (evt.target.tagName === 'IMG' && evt.target.className === 'comments') {
            openPopup()
            getVideoComments().then(({ comments, total }) => {
              window.document.getElementById('comment-popup-title').textContent = `评论(${total}条)`
              const fragment = window.document.createDocumentFragment()
              comments.forEach(comment => {
                const commentItem = commentItemTemplate.content.cloneNode(true)
                commentItem.querySelector('.comment-item').dataset.cid = comment.cid
                commentItem.querySelector('.comment-user-name').textContent = comment.name
                commentItem.querySelector('.comment-user-ip').textContent = comment.ip_label
                commentItem.querySelector('.comment-time').textContent = comment.create_time
                commentItem.querySelector('.comment-body-text').textContent = comment.text
                if (comment.digg_count) {
                  commentItem.querySelector('.comment-like').textContent = comment.digg_count
                }
                fragment.appendChild(commentItem)
              })
              window.document.getElementById('comment-popup-body').appendChild(fragment)
            })
          }
        },
        true
      )
    })
  }
  // window.setHotList = list => {}
}
const jsCode = `(${__$inject})()`
export default jsCode
