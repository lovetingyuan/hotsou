import * as Application from 'expo-application'
import * as Updates from 'expo-updates'
import React from 'react'
import { Image, Linking, Pressable, Text, ToastAndroid, View } from 'react-native'

import { HelloWave } from '@/components/HelloWave'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'

const owner = process.env.EXPO_PUBLIC_GITHUB_USER
const repo = process.env.EXPO_PUBLIC_GITHUB_REPO
const url = `https://api.github.com/repos/${owner}/${repo}/releases`

function checkAppUpdate() {
  return fetch(url, {
    method: 'GET',
    headers: {
      accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0',
    },
  })
    .then(response => {
      if (!response.ok) {
        return response.text().then(r => {
          return Promise.reject(new Error(r))
        })
      }
      return response.json()
    })
    .then(data => {
      // console.log('Latest releases:', data.length, data[0])
      // "hotsou-1.0.0.apk",
      const asset = data[0].assets.find((v: any) => v.name.endsWith('.apk'))!
      const version = asset.name.slice(0, -4).split('-')[1]
      const downloadUrl = asset.browser_download_url
      return {
        version,
        downloadUrl,
      }
    })
    .catch(error => {
      if (__DEV__) {
        console.error('There was a problem with the fetch operation:', error)
      }
    })
}
export default function About() {
  const [latestVersion, setLatestVersion] = React.useState<null | {
    version: string
    downloadUrl: string
  }>(null)

  const [checking, setChecking] = React.useState(false)
  const [helloKey, setHelloKey] = React.useState(1)
  const currentVersion = Application.nativeApplicationVersion
  const handleCheckAppUpdate = () => {
    setChecking(true)
    checkAppUpdate().then(res => {
      if (res) {
        setLatestVersion(res)
        if (res.version === currentVersion) {
          ToastAndroid.show('暂无更新', ToastAndroid.SHORT)
        } else {
          ToastAndroid.show('有更新 ' + res.version, ToastAndroid.SHORT)
        }
      } else {
        ToastAndroid.show('检查更新失败', ToastAndroid.SHORT)
      }
      setChecking(false)
    })
  }
  const fetchedVersion =
    latestVersion?.version !== currentVersion ? (
      <Text
        style={{ fontSize: 16, color: '#469b00', fontWeight: 'bold' }}
        onPress={() => {
          Linking.openURL(latestVersion!.downloadUrl)
        }}
      >
        🎉 有更新：{latestVersion?.version}, 点击下载
      </Text>
    ) : (
      <Text style={{ fontSize: 16, color: '#555' }}>暂无更新</Text>
    )
  const noFetchedVersion = checking ? (
    <Text style={{ fontSize: 16, color: '#555', fontStyle: 'italic' }}>⏳ 正在检查...</Text>
  ) : (
    <Text style={{ color: '#0065da', fontSize: 16 }} onPress={handleCheckAppUpdate}>
      检查更新
    </Text>
  )
  return (
    <ThemedView style={{ flex: 1, padding: 20, gap: 20 }}>
      <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
        <View style={{ flexDirection: 'row' }}>
          <ThemedText
            style={{ fontSize: 20 }}
            onPress={() => {
              setHelloKey(helloKey + 1)
            }}
          >
            欢迎使用本应用{' '}
          </ThemedText>
          <HelloWave key={helloKey}></HelloWave>
        </View>
        <Pressable
          onPress={() => {
            Linking.openURL('https://github.com/lovetingyuan/hotsou')
          }}
        >
          <Image
            source={{ uri: 'https://github.githubassets.com/favicons/favicon.png' }}
            style={{
              width: 20,
              height: 20,
              marginHorizontal: 5,
            }}
          ></Image>
        </Pressable>
      </ThemedView>
      <ThemedText>聚合一些媒体的热搜热点信息，仅供展示和浏览，请勿轻易相信或传播。</ThemedText>
      <ThemedText>如果使用过程中遇到问题，请及时更新版本。</ThemedText>
      <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <ThemedText>
          📊 当前版本：{currentVersion}
          {'    '}
          {Updates.createdAt
            ? Updates.createdAt.toLocaleDateString() + ' ' + Updates.createdAt.toLocaleTimeString()
            : ''}
        </ThemedText>
        {latestVersion ? fetchedVersion : noFetchedVersion}
      </View>
    </ThemedView>
  )
}
