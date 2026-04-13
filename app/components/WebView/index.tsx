import { useFocusEffect } from '@react-navigation/native'
import React, { useCallback, useEffect } from 'react'
import {
  ActivityIndicator,
  AppState,
  BackHandler,
  Image,
  Linking,
  Platform,
  Text,
  ToastAndroid,
  View,
} from 'react-native'
import { WebView as RNWebView } from 'react-native-webview'

import { useStore } from '@/store'
import { getPageIcon } from '@/utils'
import { sharePage } from '@/utils/share'

import { ThemedButton } from '../ThemedButton'
import { ThemedView } from '../ThemedView'
import InfoModal from './InfoModal'
import { beforeLoadedInject } from './inject'

const clearScrollPositionScript = `
  localStorage.removeItem("__scrollPosition");
  localStorage.removeItem("scroll-position");
  true;
`

const clearCurrentSiteStorageScript = `
  (function () {
    try {
      document.cookie.split(';').forEach(function (item) {
        var cookie = item.trim();
        if (!cookie) {
          return;
        }

        var eqPos = cookie.indexOf('=');
        var name = eqPos > -1 ? cookie.slice(0, eqPos) : cookie;
        var hostParts = location.hostname.split('.');
        var pathParts = location.pathname.split('/').filter(Boolean);
        var domains = [''];
        var paths = ['/'];

        for (var i = 0; i < hostParts.length; i += 1) {
          domains.push('.' + hostParts.slice(i).join('.'));
        }

        for (var j = 0; j < pathParts.length; j += 1) {
          paths.push('/' + pathParts.slice(0, j + 1).join('/'));
        }

        domains.forEach(function (domain) {
          paths.forEach(function (path) {
            document.cookie =
              name +
              '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' +
              path +
              (domain ? '; domain=' + domain : '');
          });
        });
      });
    } catch (error) {}

    try {
      localStorage.clear();
    } catch (error) {}

    try {
      sessionStorage.clear();
    } catch (error) {}

    try {
      if (window.caches?.keys) {
        window.caches.keys().then(function (keys) {
          keys.forEach(function (key) {
            window.caches.delete(key);
          });
        });
      }
    } catch (error) {}

    try {
      if (window.indexedDB?.databases) {
        window.indexedDB.databases().then(function (databases) {
          databases.forEach(function (database) {
            if (database?.name) {
              window.indexedDB.deleteDatabase(database.name);
            }
          });
        });
      }
    } catch (error) {}

    return true;
  })();
`

// Chrome on Android now sends a reduced UA by default, so this matches a modern Android phone.
const DEFAULT_ANDROID_USER_AGENT =
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36'

export default function WebView(props: {
  name: string
  url: string
  js?: string
  css?: string
  forbiddenUrls?: (string | RegExp)[]
  ua?: string
  dynamicJs?: string
  cookie?: string
  referer?: string
}) {
  const webViewRef = React.useRef<RNWebView | null>(null)
  const {
    reloadTab,
    showPageInfo,
    clickTab,
    clearSelection,
    $tabsList,
    shareInfo,
    reloadAllTab,
    $enableTextSelect,
    setDouyinHotId,
  } = useStore()
  const [webviewKey, setWebviewKey] = React.useState(0)
  const [useFreshSession, setUseFreshSession] = React.useState(false)
  const page = $tabsList.find((t) => t.name === props.name)
  const pageIcon = getPageIcon(page)
  // const colorScheme = useColorScheme()

  // Info Modal State
  const [infoModalVisible, setInfoModalVisible] = React.useState(false)
  const [infoModalData, setInfoModalData] = React.useState({ title: '', url: '' })

  useFocusEffect(useCallback(() => {
    const onAndroidBackPress = () => {
      if (currentNavigationStateRef.current.canGoBack && webViewRef.current) {
        webViewRef.current.goBack()
        return true
      }
      return false
    }
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress)

      return () => {
        backHandler.remove()
      }
    }
  }, []))

  useEffect(() => {
    return () => {
      webViewRef.current?.injectJavaScript(clearScrollPositionScript)
    }
  }, [])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState !== 'active') {
        webViewRef.current?.injectJavaScript(clearScrollPositionScript)
      }
    })

    return () => {
      subscription.remove()
    }
  }, [])

  const selectScript = `
      var __enableSelect = ${$enableTextSelect};
      var __style = document.getElementById('__user_select');
      if (!__style) {
        __style = document.createElement('style');
        __style.id = '__user_select';
        document.head.appendChild(__style)
      }
      __style.textContent = __enableSelect ? '' : '* { user-select: none!important; }';
      true;
    `
  useEffect(() => {
    webViewRef.current?.injectJavaScript(selectScript)
  }, [$enableTextSelect])

  useEffect(() => {
    if (reloadTab[0] === props.name) {
      webViewRef.current?.injectJavaScript(clearScrollPositionScript)
      webViewRef.current?.reload()
      if (reloadTab[1]) {
        setWebviewKey((k) => k + 1)
      }
    }
  }, [props.name, reloadTab])
  useEffect(() => {
    setWebviewKey((k) => k + 1)
  }, [reloadAllTab])

  useEffect(() => {
    const [name] = showPageInfo
    if (props.name === name) {
      const { url, title, init } = currentNavigationStateRef.current
      if (init) {
        currentNavigationStateRef.current.init = false
        return
      }
      setInfoModalData({ title, url })
      setInfoModalVisible(true)
    }
  }, [props.name, showPageInfo])

  useEffect(() => {
    const [name] = shareInfo
    if (props.name === name) {
      const { url, title } = currentNavigationStateRef.current
      sharePage(title, url)
    }
  }, [props.name, shareInfo])

  // 点击标题滚动到顶部
  useEffect(() => {
    const [name] = clickTab
    if (name === props.name && webViewRef.current) {
      const code = `
    [window, document.documentElement, '.swiper-slide-active .rank-container'].forEach(v => {
      if (typeof v==='string') {
        v = document.querySelector(v)
      }
      v?.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
     })
      `
      webViewRef.current.injectJavaScript(code + ';true;')
    }
  }, [props.name, clickTab])

  useEffect(() => {
    webViewRef.current?.injectJavaScript('window.getSelection().removeAllRanges();true;')
  }, [props.name, clearSelection])

  const [fabKey, setFabKey] = React.useState(0)
  const currentNavigationStateRef = React.useRef<{
    canGoBack: boolean
    title: string
    url: string
    init?: boolean
  }>({
    canGoBack: false,
    title: '',
    url: '',
    init: true,
  })
  useEffect(() => {
    if (props.dynamicJs) {
      webViewRef.current?.injectJavaScript(props.dynamicJs)
    }
  }, [props.dynamicJs])

  const handleClearCache = React.useCallback(async () => {
    webViewRef.current?.injectJavaScript(clearCurrentSiteStorageScript)
    webViewRef.current?.clearFormData?.()
    webViewRef.current?.clearHistory?.()
    webViewRef.current?.clearCache(true)
    setUseFreshSession(true)
    setWebviewKey((k) => k + 1)
    ToastAndroid.show('当前页面已重置为全新会话', ToastAndroid.SHORT)
  }, [])

  return (
    <>
      <RNWebView
        ref={webViewRef}
        key={'webview_' + props.name + webviewKey}
        style={{ flex: 1 }}
        allowsBackForwardNavigationGestures
        startInLoadingState
        allowsFullscreenVideo
        injectedJavaScriptForMainFrameOnly
        allowsInlineMediaPlayback
        mixedContentMode={'always'}
        originWhitelist={['*']}
        webviewDebuggingEnabled={__DEV__}
        cacheEnabled={!useFreshSession}
        incognito={useFreshSession}
        thirdPartyCookiesEnabled={false}
        userAgent={props.ua ?? DEFAULT_ANDROID_USER_AGENT}
        // userAgent="Mozilla/5.0 (Linux;u;Android 4.2.2;zh-cn;) AppleWebKit/534.46 (KHTML,like Gecko)Version/5.1 Mobile Safari/10600.6.3 (compatible; Baiduspider/2.0;+http://www.baidu.com/search/spider.html)"
        onRenderProcessGone={() => {
          // ToastAndroid.show('请刷新下页面', ToastAndroid.LONG)
          setWebviewKey((c) => c + 1)
        }}
        onLoadEnd={() => {
          webViewRef.current?.injectJavaScript(selectScript)
        }}
        injectedJavaScript={[props.js ?? '', ';true;'].join('\n')}
        injectedJavaScriptBeforeContentLoaded={beforeLoadedInject.replace(
          'CSS_CODE',
          JSON.stringify(props.css ?? ''),
        )}
        renderLoading={() => (
          <ThemedView
            style={{
              flex: 1,
              position: 'absolute',
              height: '100%',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image
              source={pageIcon}
              style={{ width: 80, height: 80, position: 'relative', top: -120 }}
            ></Image>
            <ActivityIndicator
              size='large'
              style={{ transform: [{ scale: 1.5 }], position: 'relative', top: -50 }}
            />
          </ThemedView>
        )}
        onNavigationStateChange={(navState) => {
          currentNavigationStateRef.current = {
            canGoBack: navState.canGoBack,
            title: navState.title,
            url: navState.url,
          }
          setFabKey((k) => k + 1)
        }}
        pullToRefreshEnabled
        onShouldStartLoadWithRequest={(request) => {
          if (!request.url.startsWith('http')) {
            return false
          }
          if (request.url.split('?')[0].endsWith('.apk')) {
            return false
          }
          if (
            props.forbiddenUrls?.some((v) => {
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
        renderError={(errorName) => {
          return (
            <ThemedView
              style={{
                paddingVertical: 24,
                paddingHorizontal: 12,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: '#de4600',
                }}
              >
                抱歉，网页加载失败 😔 {errorName} {'  '}
              </Text>
              <ThemedButton
                title='刷新重试'
                onPress={() => {
                  webViewRef.current?.reload()
                }}
              ></ThemedButton>
            </ThemedView>
          )
        }}
        source={{
          uri: props.url,
          ...((props.cookie || props.referer) && {
            headers: {
              ...(!useFreshSession && props.cookie ? { Cookie: props.cookie } : {}),
              ...(props.referer ? { Referer: props.referer } : {}),
            },
          }),
        }}
        onMessage={(evt) => {
          let data: { type: string; payload?: any }
          try {
            data = JSON.parse(evt.nativeEvent.data)
          } catch (e) {
            console.warn('WebView onMessage parse error:', e)
            return
          }
          switch (data.type) {
            case 'share':
              sharePage(data.payload.title, data.payload.url)
              break
            case 'download-video':
              ToastAndroid.show('请在浏览器中下载（点击视频右下方三个小点）', ToastAndroid.SHORT)
              Linking.openURL(data.payload.url)
              break
            case 'user_click':
              setFabKey((k) => k + 1)
              break
            case 'reload':
              webViewRef.current?.reload()
              break
            case 'douyin-hot-id':
              setDouyinHotId(data.payload)
              break
          }
        }}
      />
      <InfoModal
        visible={infoModalVisible}
        title={infoModalData.title}
        url={infoModalData.url}
        closeModal={() => setInfoModalVisible(false)}
        clearCache={handleClearCache}
      />
    </>
  )
}
