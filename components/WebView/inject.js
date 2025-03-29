/* eslint-env browser */

function __$inject() {
  // injectedJavascript may execute twice
  if (window.__injected) {
    return
  }
  window.__injected = true

  const noDragCss = window.document.createElement('style')

  noDragCss.innerText = `
  * {
    user-drag: none;
    -webkit-user-drag: none;
  }
  div[data-testid="cellInnerDiv"]:has(path[d="M19.498 3h-15c-1.381 0-2.5 1.12-2.5 2.5v13c0 1.38 1.119 2.5 2.5 2.5h15c1.381 0 2.5-1.12 2.5-2.5v-13c0-1.38-1.119-2.5-2.5-2.5zm-3.502 12h-2v-3.59l-5.293 5.3-1.414-1.42L12.581 10H8.996V8h7v7z"]) {
    display: none!important;
  }
  div:has(> [data-testid="Tweet-User-Avatar"]) {
    position: absolute;
    left: 0px;
    top: -8px;
  }
  [data-testid="User-Name"] {
    position: relative;
    left: 3em;
  }
  [data-testid="tweetText"] {
    text-indent: 3em;
  }
    .tgme_widget_message_user, .tgme_widget_message_bubble_tail, .tgme_widget_message_inline_keyboard {
    display: none;
    }
    .tgme_widget_message_bubble {
    margin-left: 5px;
    border-radius: 10px;
    }
  .tgme_widget_message_wrap.js-widget_message_wrap {
    margin-top: 15px;

  }
  .tgme_widget_message_text.js-message_text {
    font-size: 16px;
    line-height: 24px;
  }


  `
  window.document.head?.append(noDragCss)
  window.__waitBody = callback => {
    if (window.document.body) {
      callback()
    } else {
      window.document.addEventListener('DOMContentLoaded', callback)
    }
  }
  window.__waitBody(() => {
    window.document.head.append(noDragCss)
  })
  const sendClick = () => {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: 'user_click',
        payload: null,
      })
    )
  }
  window.addEventListener('click', sendClick, true)
  window.addEventListener('touchstart', sendClick, true)

  window.__keepScrollPosition = selector => {
    const saveScrollPosition = () => {
      if (window.location.search.includes('__main_page')) {
        const top = selector ? window.document.querySelector(selector).scrollTop : window.scrollY
        window.localStorage.setItem('__scrollPosition', top + '')
      }
    }

    const restoreScrollPosition = () => {
      if (window.location.search.includes('__main_page')) {
        const scrollPosition = window.localStorage.getItem('__scrollPosition')
        if (scrollPosition && parseInt(scrollPosition)) {
          window.localStorage.setItem('__scrollPosition', '')
          window.localStorage.removeItem('__scrollPosition')
          window.setTimeout(() => {
            window.localStorage.setItem('__scrollPosition', '')
            window.localStorage.removeItem('__scrollPosition')
            if (selector) {
              const dom = window.document.querySelector(selector)
              if (dom) {
                dom.scrollTop = parseInt(scrollPosition)
              }
            } else {
              window.scrollTo(0, parseInt(scrollPosition))
            }
          }, 300)
        }
      }
    }

    if (window.document.readyState === 'complete') {
      restoreScrollPosition()
    } else {
      window.addEventListener('load', restoreScrollPosition)
    }

    window.addEventListener('beforeunload', saveScrollPosition)
  }

  window.__markReaded = (containerClass, textClass, textsClass, onClick) => {
    window.document.addEventListener(
      'click',
      evt => {
        const itemElement = evt.target.closest(containerClass)
        if (itemElement) {
          const title = itemElement.querySelector(textClass)
          if (title) {
            const ret = onClick?.(evt, title)
            if (ret === false) {
              return
            }
            const clicked = JSON.parse(window.localStorage.getItem('__clicked__') || '{}')
            const titleText = title.innerText
            const now = Date.now()
            clicked[titleText] = now
            for (const t in clicked) {
              if (now - clicked[t] > 3 * 24 * 60 * 60 * 1000) {
                delete clicked[t]
              }
            }
            window.localStorage.setItem('__clicked__', JSON.stringify(clicked))
          }
        }
      },
      true
    )

    window.setInterval(() => {
      const clicked = JSON.parse(window.localStorage.getItem('__clicked__') || '{}')
      const items = window.document.querySelectorAll(textsClass)
      items.forEach(ele => {
        if (ele.innerText in clicked) {
          ele.style.opacity = 0.4
        }
      })
    }, 200)
  }

  window.__injectCss = () => {
    let style = window.document.querySelector('style[data-css-inject]')
    if (!style) {
      style = window.document.createElement('style')
      style.dataset.cssInject = 'true'
      window.document.head.appendChild(style)
    }
    // eslint-disable-next-line no-undef
    style.textContent = CSS_CODE
  }
  if (window.document.head) {
    window.__injectCss()
  } else {
    window.document.addEventListener('DOMContentLoaded', () => {
      window.__injectCss()
    })
  }

  // window.setInterval(() => {
  //   if (!window.document.body) {
  //     return
  //   }
  //   if (window.document.getElementById('__keep-alive__')) {
  //     window.document.getElementById('__keep-alive__')?.remove()
  //   } else {
  //     const div = window.document.createElement('div')
  //     div.id = '__keep-alive__'
  //     div.innerHTML = window.document.body.clientHeight + 'px'
  //     div.style.width = '1px'
  //     div.style.height = '1px'
  //     div.style.fontSize = '0'
  //     div.style.position = 'fixed'
  //     if (window.document.body) {
  //       window.document.body.appendChild(div)
  //     }
  //   }
  // }, 4000)

  window.__handleShare = function () {
    const url =
      window.location.hostname === 'm.douyin.com'
        ? window.location.href.split('#')[0]
        : window.location.href

    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: 'share',
        payload: {
          title: window.document.title,
          url,
        },
      })
    )
  }

  window.document.addEventListener(
    'click',
    e => {
      if (window.location.hostname === 't.me') {
        if (e.target.tagName === 'I' && e.target.classList.contains('link_preview_image')) {
          e.preventDefault()
          e.stopPropagation()
          const bg = window.getComputedStyle(e.target).backgroundImage
          if (bg.startsWith('url(')) {
            window.open(bg.slice(5, -2))
          }
        }
      }
    },
    true
  )
}

export const beforeLoadedInject = `(${__$inject})();true;`

function __$inject2() {
  if (window.__injected2) {
    return
  }
  window.__injected2 = true
  window.__waitBody?.(() => {
    if (window.__injectCss) {
      window.__injectCss()
    }
  })
  const cookies = window.document.cookie.split(';')
  for (const element of cookies) {
    const cookie = element
    const eqPos = cookie.indexOf('=')
    const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie
    window.document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
  }
  ;(function userScript() {
    // eslint-disable-next-line no-unused-expressions, no-undef
    USER_SCRIPT
  })()
}

export const injectJS = `(${__$inject2})();true;`
