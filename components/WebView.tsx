import Constants from 'expo-constants'
import { useFocusEffect } from 'expo-router'
import React, { useCallback } from 'react'
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
      div.style.position = 'fixed'
      document.body.appendChild(div)
    }
  }, 5000)
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
  url: string
  js?: string
  css?: string
  showReloadButton?: boolean
  forbiddenUrls?: (string | RegExp)[]
}) {
  const webViewRef = React.useRef<RNWebView | null>(null)
  const canGoBackRef = React.useRef(false)
  const { reloadAllTab, setReloadAllTab } = useStore()

  const showReloadButton = props.showReloadButton === undefined ? true : !!props.showReloadButton
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
        // thirdPartyCookiesEnabled={false}
        // userAgent="Mozilla/5.0 (Linux;u;Android 4.2.2;zh-cn;) AppleWebKit/534.46 (KHTML,like Gecko)Version/5.1 Mobile Safari/10600.6.3 (compatible; Baiduspider/2.0;+http://www.baidu.com/search/spider.html)"
        injectedJavaScript={`(function(){
          if (document.body.dataset.injected) return;
          document.body.dataset.injected = 'true';
          const cookies = document.cookie.split(";");
          for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
          }
          ${props.js || ''};
          })();true;`}
        onRenderProcessGone={syntheticEvent => {
          ToastAndroid.show('请刷新下页面', ToastAndroid.LONG)
        }}
        injectedJavaScriptBeforeContentLoaded={`
          document.addEventListener('DOMContentLoaded', () => {
            (${__$inject.toString().replace('CSS_CODE', JSON.stringify(props.css || ''))})();
          });
          true;`}
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
        }}
      />
      {showReloadButton ? (
        <FloatingButton
          color="#54bb00"
          style={{ opacity: 0.9, bottom: 16, right: 20 }}
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
