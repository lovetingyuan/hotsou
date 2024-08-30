import { WebView as RNWebView } from 'react-native-webview'
import Constants from 'expo-constants'
import { StyleSheet, View, ActivityIndicator, Platform, BackHandler } from 'react-native'
import React from 'react'
import { FloatingButton } from './FloattingButton'

function __$inject() {
  let style = document.querySelector('style[data-inject]')
  if (!style) {
    style = document.createElement('style')
    document.head.appendChild(style)
  }
  // @ts-ignore
  style.textContent = CSS_CODE
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
  // const [canGoBack, setCanGoBack] = React.useState(false)
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
        injectedJavaScript={`(${__$inject
          .toString()
          .replace('CSS_CODE', JSON.stringify(props.css || ''))})();${props.js || ''};true;
        `}
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
            <ActivityIndicator size="large" style={{ transform: [{ scale: 2 }] }} />
          </View>
        )}
        onNavigationStateChange={navState => {
          canGoBackRef.current = navState.canGoBack
        }}
        onShouldStartLoadWithRequest={request => {
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
        source={{
          uri: props.url,
        }}
      />
      {showReloadButton ? (
        <FloatingButton
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
