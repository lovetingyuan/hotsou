import Constants from 'expo-constants'
import { useFocusEffect } from 'expo-router'
import React, { useCallback, useEffect } from 'react'
import {
  ActivityIndicator,
  BackHandler,
  Linking,
  Platform,
  Share,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native'
import { WebView as RNWebView } from 'react-native-webview'

import { useStore } from '@/store'

import { FloatingButton } from './FloatingButton'

function __$inject() {
  const sendClick = () => {
    // @ts-ignore
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: 'user_click',
        payload: null,
      })
    )
  }
  window.addEventListener('click', sendClick, true)
  window.addEventListener('touchstart', sendClick, true)

  // @ts-ignore
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
          setTimeout(() => {
            if (selector) {
              const dom = document.querySelector(selector)
              if (dom) {
                dom.scrollTop = parseInt(scrollPosition)
              }
            } else {
              window.scrollTo(0, parseInt(scrollPosition))
            }
          }, 500)
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

  // @ts-ignore
  window.__markReaded = (containerClass, textClass, textsClass, onClick) => {
    const handleRankClick = () => {
      document.body.addEventListener(
        'click',
        evt => {
          // @ts-ignore
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
    }
    if (document.body) {
      handleRankClick()
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        handleRankClick()
      })
    }

    setInterval(() => {
      const clicked = JSON.parse(localStorage.getItem('__clicked__') || '{}')
      const items = document.querySelectorAll(textsClass)
      items.forEach(ele => {
        // @ts-ignore
        if (ele.innerText in clicked) {
          // @ts-ignore
          ele.style.opacity = 0.4
        }
      })
    }, 200)
  }
  // @ts-ignore
  window.__injectCss = () => {
    let style = document.querySelector('style[data-inject]')
    if (!style) {
      style = document.createElement('style')
      // @ts-ignore
      style.dataset.inject = 'true'
      document.head.appendChild(style)
    }
    // @ts-ignore
    style.textContent = CSS_CODE
  }
  if (document.head) {
    // @ts-ignore
    window.__injectCss()
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      // @ts-ignore
      window.__injectCss()
    })
  }

  setInterval(() => {
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
  // @ts-ignore
  window.__handleShare = function () {
    const url = location.hostname === 'm.douyin.com' ? location.href.split('#')[0] : location.href
    // @ts-ignore
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

export default function WebView(props: {
  name: string
  url: string
  js?: string
  css?: string
  forbiddenUrls?: (string | RegExp)[]
}) {
  const webViewRef = React.useRef<RNWebView | null>(null)
  const canGoBackRef = React.useRef(false)
  const { reloadAllTab, setReloadAllTab, reloadTab } = useStore()

  useFocusEffect(
    useCallback(() => {
      const onAndroidBackPress = () => {
        if (canGoBackRef.current && webViewRef.current) {
          webViewRef.current.goBack()
          return true
        }
        return false
      }
      if (Platform.OS === 'android') {
        BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress)

        return () => {
          BackHandler.removeEventListener('hardwareBackPress', onAndroidBackPress)
        }
      }
    }, [])
  )

  useEffect(() => {
    if (reloadTab[0] === props.name) {
      webViewRef.current?.injectJavaScript('localStorage.removeItem("__scrollPosition");true;')
      webViewRef.current?.reload()
    }
  }, [props.name, reloadTab])

  const [fabKey, setFabKey] = React.useState(0)

  return (
    <>
      <RNWebView
        ref={webViewRef}
        style={styles.container}
        allowsBackForwardNavigationGestures
        startInLoadingState
        allowsFullscreenVideo
        injectedJavaScriptForMainFrameOnly
        allowsInlineMediaPlayback
        mixedContentMode={'always'}
        originWhitelist={['*']}
        webviewDebuggingEnabled={__DEV__}
        thirdPartyCookiesEnabled={false}
        // userAgent="Mozilla/5.0 (Linux;u;Android 4.2.2;zh-cn;) AppleWebKit/534.46 (KHTML,like Gecko)Version/5.1 Mobile Safari/10600.6.3 (compatible; Baiduspider/2.0;+http://www.baidu.com/search/spider.html)"
        injectedJavaScript={`(function(){
          if (document.body) {
            if (document.body.dataset.injected) return;
            document.body.dataset.injected = 'true';
          }
          if (window.__injectCss) { window.__injectCss() }
          const cookies = document.cookie.split(";");
          for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
          }
          ${props.js || ''};
          })();true;`}
        onRenderProcessGone={() => {
          ToastAndroid.show('请刷新下页面', ToastAndroid.LONG)
        }}
        injectedJavaScriptBeforeContentLoaded={`(${__$inject
          .toString()
          .replace('CSS_CODE', JSON.stringify(props.css || ''))})();true;`}
        renderLoading={() => (
          <View
            style={{
              flex: 1,
              position: 'absolute',
              height: '100%',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ActivityIndicator size="large" style={{ transform: [{ scale: 1.8 }] }} />
          </View>
        )}
        onNavigationStateChange={navState => {
          canGoBackRef.current = navState.canGoBack
        }}
        pullToRefreshEnabled
        onShouldStartLoadWithRequest={request => {
          // console.log(request.url)
          if (!request.url.startsWith('http')) {
            return false
          }
          if (request.url.split('?')[0].endsWith('.apk')) {
            return false
          }
          // eslint-disable-next-line sonarjs/prefer-single-boolean-return
          if (
            props.forbiddenUrls &&
            props.forbiddenUrls.some(v => {
              if (typeof v === 'string') {
                return request.url.includes(v)
              }
              return v.test(request.url)
            })
          ) {
            return false
          }
          return true
        }}
        onContentProcessDidTerminate={() => {
          webViewRef.current?.reload()
        }}
        renderError={errorName => {
          return (
            <Text style={{ padding: 10, fontSize: 16, color: '#de4600' }}>
              抱歉，网页加载失败 😔 {errorName}
            </Text>
          )
        }}
        source={{
          uri: props.url,
        }}
        onMessage={evt => {
          const data = JSON.parse(evt.nativeEvent.data)
          if (data.type === 'share') {
            Share.share({
              message: `${data.payload.title}\n${data.payload.url}`,
            })
          }
          if (data.type === 'download-douyin-video') {
            ToastAndroid.show('请在浏览器中下载', ToastAndroid.SHORT)
            Linking.openURL(data.payload.url)
          }
          if (data.type === 'user_click') {
            setFabKey(fabKey + 1)
          }
        }}
      />

      <FloatingButton
        key={fabKey}
        color="#54bb00"
        style={{ bottom: 16, right: 18 }}
        onPress={action => {
          if (action === 'reload') {
            webViewRef.current?.reload()
          }
          if (action === 'share') {
            webViewRef.current?.injectJavaScript('window.__handleShare();')
          }
        }}
        onLongPress={action => {
          if (action === 'reload') {
            setReloadAllTab(reloadAllTab + 1)
          }
        }}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
})
