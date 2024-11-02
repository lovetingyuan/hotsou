import * as Clipboard from 'expo-clipboard'
import Constants from 'expo-constants'
import { useFocusEffect } from 'expo-router'
import React, { useCallback, useEffect } from 'react'
import {
  ActivityIndicator,
  Alert,
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

import { FloatingButton } from '../FloatingButton'
import { beforeLoadedInject, injectJS } from './inject'

export default function WebView(props: {
  name: string
  url: string
  js?: string
  css?: string
  forbiddenUrls?: (string | RegExp)[]
}) {
  const webViewRef = React.useRef<RNWebView | null>(null)
  const { reloadAllTab, setReloadAllTab, reloadTab, clickTab } = useStore()
  const [webviewKey, setWebviewKey] = React.useState(0)

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
    if (reloadTab[0] === props.name) {
      webViewRef.current?.injectJavaScript('localStorage.removeItem("__scrollPosition");true;')
      webViewRef.current?.reload()
      setWebviewKey(k => k + 1)
    }
  }, [props.name, reloadTab])

  useEffect(() => {
    const [name] = clickTab.split('_')
    if (name === props.name && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
       true;
      `)
    }
  }, [props.name, clickTab])

  const [fabKey, setFabKey] = React.useState(0)
  const currentNavigationStateRef = React.useRef<{
    canGoBack: boolean
    title: string
    url: string
  }>({
    canGoBack: false,
    title: '',
    url: '',
  })

  return (
    <>
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
        thirdPartyCookiesEnabled={false}
        // userAgent="Mozilla/5.0 (Linux;u;Android 4.2.2;zh-cn;) AppleWebKit/534.46 (KHTML,like Gecko)Version/5.1 Mobile Safari/10600.6.3 (compatible; Baiduspider/2.0;+http://www.baidu.com/search/spider.html)"
        onRenderProcessGone={() => {
          ToastAndroid.show('请刷新下页面', ToastAndroid.LONG)
        }}
        injectedJavaScript={[
          beforeLoadedInject.replace('CSS_CODE', JSON.stringify(props.css || '')),
          injectJS.replace('USER_SCRIPT', props.js || ''),
        ].join('\n')}
        injectedJavaScriptBeforeContentLoaded={beforeLoadedInject.replace(
          'CSS_CODE',
          JSON.stringify(props.css || '')
        )}
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
          currentNavigationStateRef.current = {
            canGoBack: navState.canGoBack,
            title: navState.title,
            url: navState.url,
          }
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
          if (data.type === 'reload') {
            webViewRef.current?.reload()
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
          if (action === 'share') {
            const { url, title } = currentNavigationStateRef.current
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
                //https://m.weibo.cn/profile/5309465204
                //https://m.weibo.cn/u/5309465204
                text: '确定',
                isPreferred: true,
              },
            ])
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
