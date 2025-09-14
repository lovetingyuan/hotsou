import * as Clipboard from 'expo-clipboard'
import { useFocusEffect } from 'expo-router'
import React, { useCallback, useEffect } from 'react'
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Button,
  Image,
  Linking,
  Platform,
  Share,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native'
import { WebView as RNWebView } from 'react-native-webview'

import { getTabUrl, TabsName } from '@/constants/Tabs'
import { useColorScheme } from '@/hooks/useColorScheme'
import { useStore } from '@/store'
import { getPageIcon } from '@/utils'

// import { FloatingButton } from '../FloatingButton'
import { ThemedView } from '../ThemedView'
import { beforeLoadedInject, injectJS } from './inject'

export default function WebView(props: {
  name: string
  url: string
  js?: string
  css?: string
  forbiddenUrls?: (string | RegExp)[]
  ua?: string
  dynamicJs?: string
}) {
  const webViewRef = React.useRef<RNWebView | null>(null)
  const {
    reloadTab,
    showPageInfo,
    clickTab,
    clearSelection,
    $tabsList,
    shareInfo,
    $enableTextSelect,
    setDouyinHotId,
  } = useStore()
  const [webviewKey, setWebviewKey] = React.useState(0)
  const page = $tabsList.find(t => t.name === props.name)
  const pageIcon = getPageIcon(page)
  const colorScheme = useColorScheme()
  useFocusEffect(
    useCallback(() => {
      const onAndroidBackPress = () => {
        if (currentNavigationStateRef.current.canGoBack && webViewRef.current) {
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
    return () => {
      webViewRef.current?.injectJavaScript('localStorage.removeItem("scroll-position");true;')
    }
  }, [])

  useEffect(() => {
    if (reloadTab[0] === props.name) {
      webViewRef.current?.injectJavaScript('localStorage.removeItem("__scrollPosition");true;')
      webViewRef.current?.reload()
      if (reloadTab[1]) {
        setWebviewKey(k => k + 1)
      }
    }
  }, [props.name, reloadTab])

  useEffect(() => {
    const [name] = showPageInfo.split('_')
    if (props.name === name) {
      const { url, title, init } = currentNavigationStateRef.current
      if (init) {
        currentNavigationStateRef.current.init = false
        return
      }
      Alert.alert('当前页面：' + title, 'URL: \n' + url, [
        {
          text: '浏览器打开',
          onPress: () => {
            Linking.openURL(url)
          },
        },
        {
          text: '复制链接',
          onPress() {
            Clipboard.setStringAsync(url).then(() => {
              ToastAndroid.show('已复制', ToastAndroid.SHORT)
            })
          },
          style: 'destructive',
        },
        {
          text: 'OK',
          isPreferred: true,
        },
      ])
    }
  }, [props.name, showPageInfo])

  useEffect(() => {
    const [name] = shareInfo.split('_')
    if (props.name === name) {
      const { url, title } = currentNavigationStateRef.current

      Share.share({
        title,
        message: title + '\n' + url,
        url,
      })
    }
  }, [props.name, shareInfo])

  useEffect(() => {
    const [name] = clickTab
    if (name === props.name && webViewRef.current) {
      const code = `
      if (location.href.split('?')[0] === "${getTabUrl(TabsName.wangyi)?.split('?')[0]}") {
        document.querySelector('.swiper-slide-active .rank-container')?.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
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
  return (
    <RNWebView
      ref={webViewRef}
      key={'webview_' + props.name + webviewKey}
      style={styles.container}
      allowsBackForwardNavigationGestures
      startInLoadingState
      allowsFullscreenVideo
      injectedJavaScriptForMainFrameOnly
      allowsInlineMediaPlayback
      mixedContentMode={'always'}
      originWhitelist={['*']}
      webviewDebuggingEnabled={__DEV__}
      forceDarkOn={true} // Android only
      thirdPartyCookiesEnabled={false}
      userAgent={
        props.ua ||
        'Mozilla/5.0 (Linux; Android 13; M2012K11AC Build/TKQ1.220829.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/139.0.7258.160 Mobile Safari/537.36'
      }
      // userAgent="Mozilla/5.0 (Linux;u;Android 4.2.2;zh-cn;) AppleWebKit/534.46 (KHTML,like Gecko)Version/5.1 Mobile Safari/10600.6.3 (compatible; Baiduspider/2.0;+http://www.baidu.com/search/spider.html)"
      onRenderProcessGone={() => {
        // ToastAndroid.show('请刷新下页面', ToastAndroid.LONG)
        setWebviewKey(c => c + 1)
      }}
      injectedJavaScript={[
        beforeLoadedInject.replace('CSS_CODE', JSON.stringify(props.css || '')),
        injectJS.replace('USER_SCRIPT', props.js || ''),
      ].join('\n')}
      injectedJavaScriptBeforeContentLoaded={beforeLoadedInject.replace(
        'CSS_CODE',
        JSON.stringify(`
          ${props.css ?? ''}
${
  colorScheme === 'dark'
    ? `
 html, img, video {
  filter: invert(1) hue-rotate(.5turn);
}
img {
  opacity: .75;
}
  `
    : ''
}
${!$enableTextSelect ? '* { user-select: none!important; }' : ''}    `)
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
            size="large"
            style={{ transform: [{ scale: 1.8 }], position: 'relative', top: -50 }}
          />
        </ThemedView>
      )}
      onNavigationStateChange={navState => {
        currentNavigationStateRef.current = {
          canGoBack: navState.canGoBack,
          title: navState.title,
          url: navState.url,
        }
        setFabKey(fabKey + 1)
      }}
      pullToRefreshEnabled
      onShouldStartLoadWithRequest={request => {
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
          <View
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
            <Button
              title="刷新重试"
              onPress={() => {
                webViewRef.current?.reload()
              }}
            ></Button>
          </View>
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
        if (data.type === 'download-video') {
          ToastAndroid.show('请在浏览器中下载（点击视频右下方三个小点）', ToastAndroid.SHORT)
          Linking.openURL(data.payload.url)
        }
        if (data.type === 'user_click') {
          setFabKey(fabKey + 1)
        }
        if (data.type === 'reload') {
          webViewRef.current?.reload()
        }
        if (data.type === 'douyin-hot-id') {
          setDouyinHotId(data.payload)
        }
      }}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginTop: Constants.statusBarHeight,
  },
})
