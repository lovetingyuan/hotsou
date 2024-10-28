import * as Application from 'expo-application'
import * as Updates from 'expo-updates'
import React from 'react'
import { Linking, Text, ToastAndroid, TouchableOpacity } from 'react-native'

import checkAppUpdate from '@/utils/checkAppUpdate'

import { ThemedText } from '../ThemedText'
import { ThemedView } from '../ThemedView'

// @ts-ignore
const gitHash = typeof GIT_HASH === 'string' ? GIT_HASH : 'N/A'

export default function Version() {
  const [latestVersion, setLatestVersion] = React.useState<null | {
    version: string
    downloadUrl: string
  }>(null)

  const [checking, setChecking] = React.useState(false)
  const currentVersion = Application.nativeApplicationVersion
  const handleCheckAppUpdate = () => {
    setChecking(true)
    checkAppUpdate()
      .then(res => {
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
      .catch(err => {
        setChecking(false)
        ToastAndroid.show('检查更新失败!', ToastAndroid.SHORT)
        throw err
      })
  }
  const fetchedVersion =
    latestVersion?.version !== currentVersion ? (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => {
          Linking.openURL(latestVersion!.downloadUrl)
          ToastAndroid.show('请在浏览器中下载', ToastAndroid.SHORT)
        }}
      >
        <Text style={{ fontSize: 16, color: '#469b00', fontWeight: 'bold' }}>
          🎉 有更新：{latestVersion?.version} 点击下载⬇
        </Text>
      </TouchableOpacity>
    ) : (
      <Text style={{ fontSize: 16, color: '#888' }}>暂无更新</Text>
    )
  const noFetchedVersion = checking ? (
    <Text style={{ fontSize: 16, color: '#888', fontStyle: 'italic' }}>⏳ 正在检查...</Text>
  ) : (
    <TouchableOpacity activeOpacity={0.5} onPress={handleCheckAppUpdate}>
      <Text style={{ color: '#0065da', fontSize: 16 }}>检查更新</Text>
    </TouchableOpacity>
  )
  return (
    <ThemedView style={{ flexDirection: 'row', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
      <ThemedText
        onPress={() => {
          if (Updates.createdAt) {
            ToastAndroid.show(
              '更新时间：' +
                Updates.createdAt.toLocaleDateString() +
                ' ' +
                Updates.createdAt.toLocaleTimeString() +
                ' ' +
                gitHash,
              ToastAndroid.SHORT
            )
          }
        }}
      >
        📊 当前版本：{currentVersion}
      </ThemedText>
      {latestVersion ? fetchedVersion : noFetchedVersion}
    </ThemedView>
  )
}
