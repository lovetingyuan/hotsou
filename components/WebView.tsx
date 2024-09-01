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
  Share,
} from 'react-native'
import React, { useCallback } from 'react'
import { FloatingButton } from './FloatingButton2'
import { useFocusEffect } from 'expo-router'

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
  }, 500)
  // @ts-ignore
  window.__handleShare = function () {
    // @ts-ignore
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: 'share',
        payload: {
          title: document.title,
          url: location.href,
        },
      })
    )
  }
  if (document.getElementById('__tool-bar__')) {
    const toolbar = document.createElement('div')
    toolbar.id = '__tool-bar__'
    toolbar.className = 'toolbar'
    toolbar.innerHTML = `
    <style>
        .toolbar {
            position: fixed;
            left: 20px;
            bottom: 20px;
            display: flex;
            flex-direction: column-reverse;
            align-items: center;
            z-index: 1000;
        }

        .toolbar button {
            width: 50px;
            height: 50px;
            border-radius: 25px;
            border: none;
            background-color: #007bff;
            color: white;
            cursor: pointer;
            margin-top: 10px;
            transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
        }

        .toolbar button:hover {
            background-color: #0056b3;
        }

        .toolbar .function-btn {
        font-size: 14px;
            transform: translateY(20px);
            opacity: 0;
            pointer-events: none;
        }

        .toolbar.expanded .function-btn {
            transform: translateY(0);
            opacity: 1;
            pointer-events: auto;
        }

        #controlBtn {
            font-size: 20px;
            z-index: 1001;
        }
    </style>
      <button id="controlBtn" onclick="document.getElementById('__tool-bar__').classList.toggle('expanded');">☰</button>
      <button class="function-btn" onclick="__handleShare()">分享</button>
      <button class="function-btn" onclick="location.reload()">刷新</button>
    `
    toolbar.style.position = 'fixed'
    document.body.appendChild(toolbar)
  }
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

        return () => BackHandler.removeEventListener('hardwareBackPress', onAndroidBackPress)
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
          if (request.url.includes('passport.weibo.com')) {
            return false
          }
          if (request.url.includes('activity.baidu.com/mbox')) {
            return false
          }
          if (request.url.includes('wappass.baidu.com')) {
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
        onMessage={evt => {
          const data = JSON.parse(evt.nativeEvent.data)
          if (data.type === 'share') {
            Share.share({
              message: `${data.payload.title}\n${data.payload.url}`,
            })
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
