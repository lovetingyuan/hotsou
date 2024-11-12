import { useDrawerStatus } from '@react-navigation/drawer'
import React from 'react'

import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'
import { useStore } from '@/store'

function __$inject() {
  setInterval(() => {
    if (location.href.startsWith('https://m.weibo.cn/profile/')) {
      history.replaceState({}, '', location.href.replace('/profile/', '/u/'))
      // @ts-ignore
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'reload',
          payload: {},
        })
      )
    }
  }, 200)
  if (location.pathname.startsWith('/p/106003')) {
    history.scrollRestoration = 'auto'
    // @ts-ignore
    window.__markReaded?.('div[callback]', '.main-text', 'div[callback] .main-text')
    // @ts-ignore
    // window.__keepScrollPosition?.()
  }
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting && entry.target.tagName === 'VIDEO') {
          // @ts-ignore
          entry.target.pause()
        }
      })
    },
    {
      root: null,
      threshold: 0,
    }
  )

  window.addEventListener(
    'loadstart',
    e => {
      // @ts-ignore
      if (!e.target.id && e.target.tagName === 'VIDEO' && e.target.src) {
        // @ts-ignore
        e.target.muted = false
        // @ts-ignore
        e.target.setAttribute('controls', '')
        // @ts-ignore
        if (!e.target.dataset.observed) {
          // @ts-ignore
          e.target.dataset.observed = 'true'
          // @ts-ignore
          observer.observe(e.target)
        }
      }
    },
    true
  )
}

export default function Weibo() {
  // https://s.weibo.com/top/summary?cate=realtimehot
  const drawerStatus = useDrawerStatus()
  const { setClearSelection } = useStore()
  React.useEffect(() => {
    if (drawerStatus === 'open') {
      // eslint-disable-next-line sonarjs/pseudo-random
      setClearSelection(Math.random())
      setTimeout(() => {
        setClearSelection(Date.now())
      }, 100)
      setTimeout(() => {
        setClearSelection(Date.now())
      }, 200)
      setTimeout(() => {
        setClearSelection(Date.now())
      }, 300)
    }
  }, [drawerStatus, setClearSelection])
  return (
    <WebView
      name={TabsName.weibo}
      url={getTabUrl(TabsName.weibo)!}
      css={`
        div.card.m-panel.card4:has(img[src*='search_point_orange']) {
          display: none;
        }
        div.card.m-panel.card4:has(img[src*='search_stick']) {
          display: none;
        }
        iframe,
        .main .card .wrap,
        .nav-left,
        .m-tab-bar.m-bar-panel.m-container-max {
          display: none !important;
        }
        div:has(> div.m-top-bar) {
          display: none;
        }
      `}
      js={`(${__$inject})()`}
      forbiddenUrls={['passport.weibo.com', 'm.weibo.cn/feature/applink']}
    />
  )
}
