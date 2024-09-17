import * as Application from 'expo-application'
import * as Updates from 'expo-updates'
import React from 'react'
import { Linking, Text, ToastAndroid } from 'react-native'

import { ThemedText } from '../ThemedText'
import { ThemedView } from '../ThemedView'

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

export default function Version() {
  const [latestVersion, setLatestVersion] = React.useState<null | {
    version: string
    downloadUrl: string
  }>(null)

  const [checking, setChecking] = React.useState(false)
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
    <ThemedView style={{ flexDirection: 'row', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
      <ThemedText>
        📊 当前版本：{currentVersion}
        {'    '}
        {Updates.createdAt
          ? Updates.createdAt.toLocaleDateString() + ' ' + Updates.createdAt.toLocaleTimeString()
          : ''}
      </ThemedText>
      {latestVersion ? fetchedVersion : noFetchedVersion}
    </ThemedView>
  )
}
