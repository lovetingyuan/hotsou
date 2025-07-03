import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { WebView as RNWebView } from 'react-native-webview'

import cssCode from '@/components/douyin/css'
import jsCode from '@/components/douyin/inject'
import WebView from '@/components/WebView'
import { getTabUrl, TabsName } from '@/constants/Tabs'
import { useStore } from '@/store'

interface EvtItemType {
  event_time: number
  hot_value: number
  label_url: string
  max_rank: number
  position: number
  sentence_id: string
  video_count: number
  word: string
}
export default function Douyin() {
  const [url, setUrl] = useState('')
  const [dynamicJs, setDynamicJs] = useState('')
  const { douyinHotId, setDouyinHotId } = useStore()
  useEffect(() => {
    fetch('https://aweme-hl.snssdk.com/aweme/v1/hot/search/list/')
      .then(res => res.json())
      .then(
        (res: {
          status_code: number
          data: {
            word_list: EvtItemType[]
          }
        }) => {
          setUrl(
            getTabUrl(TabsName.douyin) +
              '#__hot_list=' +
              encodeURIComponent(JSON.stringify(res.data.word_list))
          )
          // setDynamicJs(`
          //   window.__hot_list = ${JSON.stringify(res.data.word_list)};
          //   `)
        }
      )
  }, [])
  if (!url) {
    return null
  }
  return (
    <>
      <WebView
        name={TabsName.douyin}
        url={url}
        js={jsCode}
        css={cssCode}
        dynamicJs={dynamicJs}
        // ua="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0"
        forbiddenUrls={['z.douyin.com', 'zijieapi.com', '/log-sdk/collect/']}
      />
      {douyinHotId ? (
        <View style={{ width: 0, height: 0, opacity: 0 }}>
          <RNWebView
            source={{
              uri: 'https://www.douyin.com/hot/' + douyinHotId,
            }}
            injectedJavaScript={`
          setInterval(() => {
            if (location.pathname.startsWith('/video/')) {
              const id = location.pathname.split('/').pop()
              window.ReactNativeWebView.postMessage(id)
            }
          }, 50);

          `}
            userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0"
            onMessage={evt => {
              const id = evt.nativeEvent.data
              setDynamicJs(`window.location.href = "https://m.douyin.com/share/video/${id}";`)
              setDouyinHotId('')
              // setDouyinVideoId(id)
            }}
          ></RNWebView>
        </View>
      ) : null}
    </>
  )
}
