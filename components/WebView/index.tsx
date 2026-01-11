import { useFocusEffect } from '@react-navigation/native'
import * as Clipboard from 'expo-clipboard'
import React, { useCallback, useEffect } from 'react'
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Button,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native'
import { WebView as RNWebView } from 'react-native-webview'

import { useColorScheme } from '@/hooks/useColorScheme'
import { useStore } from '@/store'
import { getPageIcon } from '@/utils'

import { ThemedText } from '../ThemedText'
// import { FloatingButton } from '../FloatingButton'
import { ThemedView } from '../ThemedView'
import { beforeLoadedInject } from './inject'

function InfoModal(props: {
  visible: boolean
  title: string
  url: string
  closeModal: () => void
}) {
  const colorScheme = useColorScheme()
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={props.visible}
      statusBarTranslucent={true}
      onRequestClose={() => {
        props.closeModal()
      }}
    >
      <View style={styles.centeredView}>
        <ThemedView
          style={[styles.modalView, { shadowColor: colorScheme === 'dark' ? 'white' : 'black' }]}
        >
          <ThemedText style={{ fontWeight: 'bold', fontSize: 18 }} selectable>
            {props.title || '当前页面'}
          </ThemedText>
          <ScrollView style={{ maxHeight: 120 }}>
            <ThemedText selectable style={{ opacity: 0.7 }}>
              {props.url}
            </ThemedText>
          </ScrollView>

          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              marginTop: 20,
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
            }}
          >
            <Button
              title=" 浏览器打开 "
              onPress={() => {
                Linking.openURL(props.url)
                props.closeModal()
              }}
            />
            <Button
              title=" 分享 "
              color={'#2196F3'}
              onPress={() => {
                Share.share({
                  title: props.title,
                  message: props.title + '\n' + props.url,
                  url: props.url,
                })
                props.closeModal()
              }}
            />
            <Button
              title=" 复制链接 "
              color={'#ff4444'}
              onPress={() => {
                Clipboard.setStringAsync(props.url).then(() => {
                  ToastAndroid.show('已复制', ToastAndroid.SHORT)
                })
                props.closeModal()
              }}
            />
          </View>
          <TouchableOpacity
            onPress={props.closeModal}
            style={{ position: 'absolute', top: 10, right: 10, padding: 5 }}
            hitSlop={10}
          >
            <ThemedText style={{ fontSize: 20, color: '#999' }}>✕</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </View>
    </Modal>
  )
}

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
    reloadAllTab,
    $enableTextSelect,
    setDouyinHotId,
  } = useStore()
  const [webviewKey, setWebviewKey] = React.useState(0)
  const page = $tabsList.find(t => t.name === props.name)
  const pageIcon = getPageIcon(page)
  // const colorScheme = useColorScheme()

  // Info Modal State
  const [infoModalVisible, setInfoModalVisible] = React.useState(false)
  const [infoModalData, setInfoModalData] = React.useState({ title: '', url: '' })

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
        const backHandler = BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress)

        return () => {
          backHandler.remove()
        }
      }
    }, [])
  )

  useEffect(() => {
    return () => {
      webViewRef.current?.injectJavaScript('localStorage.removeItem("scroll-position");true;')
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
      webViewRef.current?.injectJavaScript('localStorage.removeItem("__scrollPosition");true;')
      webViewRef.current?.reload()
      if (reloadTab[1]) {
        setWebviewKey(k => k + 1)
      }
    }
  }, [props.name, reloadTab])
  useEffect(() => {
    setWebviewKey(k => k + 1)
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

      Share.share({
        title,
        message: title + '\n' + url,
        url,
      })
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
        thirdPartyCookiesEnabled={false}
        userAgent={props.ua}
        // userAgent="Mozilla/5.0 (Linux;u;Android 4.2.2;zh-cn;) AppleWebKit/534.46 (KHTML,like Gecko)Version/5.1 Mobile Safari/10600.6.3 (compatible; Baiduspider/2.0;+http://www.baidu.com/search/spider.html)"
        onRenderProcessGone={() => {
          // ToastAndroid.show('请刷新下页面', ToastAndroid.LONG)
          setWebviewKey(c => c + 1)
        }}
        onLoadEnd={() => {
          webViewRef.current?.injectJavaScript(selectScript)
        }}
        injectedJavaScript={[props.js, ';true;'].join('\n')}
        injectedJavaScriptBeforeContentLoaded={beforeLoadedInject.replace(
          'CSS_CODE',
          JSON.stringify(props.css ?? '')
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
              style={{ transform: [{ scale: 1.5 }], position: 'relative', top: -50 }}
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
          if (
            props.forbiddenUrls?.some(v => {
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
          switch (data.type) {
            case 'share':
              Share.share({
                message: `${data.payload.title}\n${data.payload.url}`,
              })
              break
            case 'download-video':
              ToastAndroid.show('请在浏览器中下载（点击视频右下方三个小点）', ToastAndroid.SHORT)
              Linking.openURL(data.payload.url)
              break
            case 'user_click':
              setFabKey(fabKey + 1)
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
      />
    </>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    borderRadius: 10,
    paddingVertical: 25,
    paddingHorizontal: 20,
    width: '80%',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'column',
    gap: 20,
  },
})
