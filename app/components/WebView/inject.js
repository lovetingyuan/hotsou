function __$injectBeforeLoad() {
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
      }),
    )
  }
  window.addEventListener('click', sendClick, true)
  window.addEventListener('touchstart', sendClick, true)

  window.__keepScrollPosition = (selector, distanceAdjust = 0, waitContainer) => {
    const scrollStorageKey = '__scrollPosition'
    const maxRestoreAttempts = 40
    const restoreInterval = 50
    const stableThreshold = 3

    window.__scrollPositionCleanup?.()

    const clearSavedScrollPosition = () => {
      window.localStorage.setItem(scrollStorageKey, '')
      window.localStorage.removeItem(scrollStorageKey)
    }

    const getTargetElement = () => {
      if (!selector) {
        return null
      }
      try {
        return window.document.querySelector(selector)
      } catch (error) {
        console.warn('[__keepScrollPosition] Invalid selector:', selector, error)
        return null
      }
    }

    const getScrollableTarget = () => {
      const element = getTargetElement()
      if (selector && !element) {
        return null
      }
      return element ?? window.document.scrollingElement ?? window.document.documentElement
    }

    const getCurrentScrollTop = target => {
      if (!selector) {
        return window.scrollY
      }
      return target?.scrollTop ?? 0
    }

    const saveScrollPosition = () => {
      const target = getScrollableTarget()
      if (!target && selector) {
        return
      }
      const top = getCurrentScrollTop(target)
      window.localStorage.setItem(scrollStorageKey, top + '')
    }

    const restoreScrollPosition = () => {
      const rawScrollPosition = window.localStorage.getItem(scrollStorageKey)
      if (rawScrollPosition === null || rawScrollPosition === '') {
        return
      }

      const savedScrollPosition = Number.parseInt(rawScrollPosition, 10)
      if (Number.isNaN(savedScrollPosition)) {
        clearSavedScrollPosition()
        return
      }

      const targetScrollTop = Math.max(0, savedScrollPosition + distanceAdjust)
      let attempts = 0
      let previousMetric = ''
      let stableCount = 0
      let intervalId = 0
      let observer = null
      let observerTimer = 0

      const cleanupRestore = (shouldClearStorage = false) => {
        if (intervalId) {
          window.clearInterval(intervalId)
          intervalId = 0
        }
        if (observerTimer) {
          window.clearTimeout(observerTimer)
          observerTimer = 0
        }
        if (observer) {
          observer.disconnect()
          observer = null
        }
        if (shouldClearStorage) {
          clearSavedScrollPosition()
        }
      }

      const applyScroll = (target, top) => {
        if (selector) {
          target.scrollTop = top
          return target.scrollTop
        }
        window.scrollTo(0, top)
        return window.scrollY
      }

      // Retry until the async list height stops changing, then do one final best-effort restore.
      const attemptRestore = () => {
        attempts += 1
        const target = getScrollableTarget()
        if (!target) {
          if (attempts >= maxRestoreAttempts) {
            cleanupRestore(false)
          }
          return
        }

        const maxScrollTop = selector
          ? Math.max(0, target.scrollHeight - target.clientHeight)
          : Math.max(0, target.scrollHeight - window.innerHeight)
        const currentMetric = maxScrollTop + ':' + target.scrollHeight
        stableCount = currentMetric === previousMetric ? stableCount + 1 : 0
        previousMetric = currentMetric

        const nextTop =
          stableCount >= stableThreshold ? Math.min(targetScrollTop, maxScrollTop) : targetScrollTop
        const currentScrollTop = applyScroll(target, nextTop)
        const reachedTarget = Math.abs(currentScrollTop - nextTop) <= 2
        const domStable = stableCount >= stableThreshold

        if (
          reachedTarget &&
          (nextTop === targetScrollTop || domStable || maxScrollTop >= targetScrollTop)
        ) {
          cleanupRestore(true)
          return
        }

        if (attempts >= maxRestoreAttempts) {
          applyScroll(target, Math.min(targetScrollTop, maxScrollTop))
          cleanupRestore(true)
        }
      }

      attemptRestore()
      intervalId = window.setInterval(attemptRestore, restoreInterval)
      if (window.MutationObserver && window.document.documentElement) {
        observer = new window.MutationObserver(() => {
          if (observerTimer) {
            return
          }
          observerTimer = window.setTimeout(() => {
            observerTimer = 0
            attemptRestore()
          }, 80)
        })
        observer.observe(window.document.documentElement, {
          childList: true,
          subtree: true,
          attributes: true,
        })
      }
    }

    const onLoad = () => {
      restoreScrollPosition()
    }
    if (waitContainer) {
      const timer = setInterval(() => {
        const container = document.querySelector(waitContainer)
        if (container && container.childElementCount > 10) {
          clearInterval(timer)
          restoreScrollPosition()
        }
      }, 20)
    } else if (window.document.readyState === 'complete') {
      restoreScrollPosition()
    } else {
      window.addEventListener('load', onLoad)
    }

    window.addEventListener('pagehide', saveScrollPosition)
    window.__scrollPositionCleanup = () => {
      window.removeEventListener('load', onLoad)
      window.removeEventListener('pagehide', saveScrollPosition)
    }
  }
  window.__markRead = (containerClass, textClass, textsClass) => {
    window.document.addEventListener(
      'click',
      evt => {
        const itemElement = evt.target.closest(containerClass)
        if (itemElement) {
          const title =
            typeof textClass === 'function'
              ? textClass(itemElement)
              : itemElement.querySelector(textClass)
          if (title) {
            const clicked = JSON.parse(window.localStorage.getItem('__clicked__') || '{}')
            const titleText = title.nodeType === 3 ? title.textContent : title.innerText
            const now = Date.now()
            clicked[titleText] = now
            for (const t in clicked) {
              if (now - clicked[t] > 5 * 24 * 60 * 60 * 1000) {
                delete clicked[t]
              }
            }
            window.localStorage.setItem('__clicked__', JSON.stringify(clicked))
          }
        }
      },
      true,
    )

    const timer = window.setInterval(() => {
      const clicked = JSON.parse(window.localStorage.getItem('__clicked__') || '{}')
      if (typeof textsClass === 'function') {
        const result = textsClass()
        for (const text in result) {
          if (text in clicked) {
            result[text].style.opacity = 0.4
          }
        }
      } else {
        const items = window.document.querySelectorAll(textsClass)
        items.forEach(ele => {
          if (ele.innerText in clicked) {
            ele.style.opacity = 0.4
          }
        })
      }
    }, 50)
    window.addEventListener('load', () => {
      setTimeout(() => {
        clearInterval(timer)
      }, 3000)
    })
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
}

export const beforeLoadedInject = `(${__$injectBeforeLoad})();true;`
