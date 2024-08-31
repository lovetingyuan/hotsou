import { WebView as RNWebView } from 'react-native-webview'
import Constants from 'expo-constants'
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Platform,
  BackHandler,
  ToastAndroid,
  Text,
} from 'react-native'
import React from 'react'
import { FloatingButton } from './FloatingButton'

function __$inject() {
  let style = document.querySelector('style[data-inject]')
  if (!style) {
    style = document.createElement('style')
    // @ts-ignore
    style.dataset.inject = 'true'
    document.head.appendChild(style)
  }
  // @ts-ignore
  style.textContent = CSS_CODE
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
      document.body.appendChild(div)
    }
  }, 500)
}

export default function WebView(props: {
  url: string
  js?: string
  css?: string
  showReloadButton?: boolean
}) {
  const webViewRef = React.useRef<RNWebView | null>(null)
  const canGoBackRef = React.useRef(false)
  const showReloadButton = props.showReloadButton === undefined ? true : !!props.showReloadButton
  React.useEffect(() => {
    const onAndroidBackPress = () => {
      if (canGoBackRef.current && webViewRef.current) {
        webViewRef.current.goBack()
        return true
      }
      return false
    }
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress)

      return () => BackHandler.removeEventListener('hardwareBackPress', onAndroidBackPress)
    }
  }, [])

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
        // userAgent="Mozilla/5.0 (Linux;u;Android 4.2.2;zh-cn;) AppleWebKit/534.46 (KHTML,like Gecko)Version/5.1 Mobile Safari/10600.6.3 (compatible; Baiduspider/2.0;+http://www.baidu.com/search/spider.html)"
        injectedJavaScript={`(${__$inject
          .toString()
          .replace('CSS_CODE', JSON.stringify(props.css || ''))})();${props.js || ''};true;
        `}
        onRenderProcessGone={syntheticEvent => {
          ToastAndroid.show('请刷新下页面', ToastAndroid.SHORT)
        }}
        // injectedJavaScriptBeforeContentLoaded
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
        onShouldStartLoadWithRequest={request => {
          // console.log(request.url)
          if (request.url.includes('.apk')) {
            return false
          }
          if (!request.url.startsWith('http')) {
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
      />
      {showReloadButton ? (
        <FloatingButton
          color="#54bb00"
          style={{ opacity: 0.8 }}
          onPress={() => {
            webViewRef.current?.reload()
          }}
        ></FloatingButton>
      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
})
