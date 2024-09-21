/* eslint-env browser */

function __$inject() {
  // injectedJavascript may execute twice
  if (window.__injected) {
    return
  }
  window.__injected = true
  window.__waitBody = callback => {
    if (document.body) {
      callback()
    } else {
      document.addEventListener('DOMContentLoaded', callback)
    }
  }
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
      if (location.search.includes('__main_page')) {
        const top = selector ? document.querySelector(selector).scrollTop : window.scrollY
        localStorage.setItem('__scrollPosition', top + '')
      }
    }

    const restoreScrollPosition = () => {
      if (location.search.includes('__main_page')) {
        const scrollPosition = localStorage.getItem('__scrollPosition')
        if (scrollPosition && parseInt(scrollPosition)) {
          localStorage.setItem('__scrollPosition', '')
          localStorage.removeItem('__scrollPosition')
          setTimeout(() => {
            localStorage.setItem('__scrollPosition', '')
            localStorage.removeItem('__scrollPosition')
            if (selector) {
              const dom = document.querySelector(selector)
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

    if (document.readyState === 'complete') {
      restoreScrollPosition()
    } else {
      window.addEventListener('load', restoreScrollPosition)
    }

    window.addEventListener('beforeunload', saveScrollPosition)
  }

  window.__markReaded = (containerClass, textClass, textsClass, onClick) => {
    document.addEventListener(
      'click',
      evt => {
        const itemElement = evt.target.closest(containerClass)
        if (itemElement) {
          const title = itemElement.querySelector(textClass)
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
            onClick?.(evt, title)
          }
        }
      },
      true
    )

    setInterval(() => {
      const clicked = JSON.parse(localStorage.getItem('__clicked__') || '{}')
      const items = document.querySelectorAll(textsClass)
      items.forEach(ele => {
        if (ele.innerText in clicked) {
          ele.style.opacity = 0.4
        }
      })
    }, 200)
  }

  window.__injectCss = () => {
    let style = document.querySelector('style[data-css-inject]')
    if (!style) {
      style = document.createElement('style')
      style.dataset.cssInject = 'true'
      document.head.appendChild(style)
    }
    // eslint-disable-next-line no-undef
    style.textContent = CSS_CODE
  }
  if (document.head) {
    window.__injectCss()
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      window.__injectCss()
    })
  }

  setInterval(() => {
    if (!document.body) {
      return
    }
    if (document.getElementById('__keep-alive__')) {
      document.getElementById('__keep-alive__')?.remove()
    } else {
      const div = document.createElement('div')
      div.id = '__keep-alive__'
      div.innerHTML = document.body.clientHeight + 'px'
      div.style.width = '1px'
      div.style.height = '1px'
      div.style.fontSize = '0'
      div.style.position = 'fixed'
      if (document.body) {
        document.body.appendChild(div)
      }
    }
  }, 4000)

  window.__handleShare = function () {
    const url = location.hostname === 'm.douyin.com' ? location.href.split('#')[0] : location.href

    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: 'share',
        payload: {
          title: document.title,
          url,
        },
      })
    )
  }
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
  const cookies = document.cookie.split(';')
  for (const element of cookies) {
    const cookie = element
    const eqPos = cookie.indexOf('=')
    const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
  }
  ;(function userScript() {
    // eslint-disable-next-line sonarjs/no-unused-expressions, no-unused-expressions, no-undef
    USER_SCRIPT
  })()
}

export const injectJS = `(${__$inject2})();true;`
