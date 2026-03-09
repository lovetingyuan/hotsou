import * as Application from 'expo-application'
import * as Updates from 'expo-updates'
import React from 'react'
import { Alert, Linking, ToastAndroid, TouchableOpacity, View } from 'react-native'

import { ExternalLink } from '@/components/ExternalLink'
import { ThemedText } from '@/components/ThemedText'
import { useThemeColor } from '@/hooks/useThemeColor'
import checkAppUpdate from '@/utils/checkAppUpdate'

// @ts-ignore
const gitHash = typeof GIT_HASH === 'string' ? GIT_HASH : 'N/A'
// @ts-ignore
const buildDate = typeof BUILD_DATE === 'number' ? BUILD_DATE : Date.now()

export default function Version() {
  const primaryColor = useThemeColor({}, 'primary')
  const [latestVersion, setLatestVersion] = React.useState<null | {
    version: string
    downloadUrl: string
  }>(null)

  const [checking, setChecking] = React.useState(false)
  const currentVersion = Application.nativeApplicationVersion
  const handleCheckAppUpdate = () => {
    setChecking(true)
    checkAppUpdate()
      .then((res) => {
        if (res) {
          setLatestVersion(res)
          if (res.version === currentVersion) {
            ToastAndroid.show('暂无更新', ToastAndroid.SHORT)
          } else {
            Alert.alert(
              '🎉 有新版',
              `最新版 ${res.version}（当前：${currentVersion}）\n\n${res.changelog}`,
              [
                {
                  text: '取消',
                },
                {
                  text: '下载',
                  isPreferred: true,
                  onPress: () => {
                    ToastAndroid.show('请在浏览器中下载并信任安装', ToastAndroid.SHORT)
                    Linking.openURL(res.downloadUrl)
                  },
                },
              ],
            )
          }
        } else {
          ToastAndroid.show('检查更新失败', ToastAndroid.SHORT)
        }
        setChecking(false)
      })
      .catch((err) => {
        setChecking(false)
        ToastAndroid.show('检查更新失败!', ToastAndroid.SHORT)
        throw err
      })
  }
  const versionView = () => {
    if (latestVersion) {
      return latestVersion?.version !== currentVersion ? (
        <ExternalLink
          href={latestVersion!.downloadUrl}
          onPress={() => {
            ToastAndroid.show('请在浏览器中下载并信任安装', ToastAndroid.SHORT)
          }}
        >
          <ThemedText style={{ fontSize: 16, color: '#469b00', fontWeight: 'bold' }}>
            🎉 有更新：{latestVersion?.version} 点击下载⬇
          </ThemedText>
        </ExternalLink>
      ) : (
        <ThemedText style={{ fontSize: 16, color: '#888' }}>暂无更新</ThemedText>
      )
    }
    return checking ? (
      <ThemedText style={{ fontSize: 16, color: '#888', fontStyle: 'italic' }}>
        ⏳ 正在检查...
      </ThemedText>
    ) : (
      <TouchableOpacity activeOpacity={0.5} onPress={handleCheckAppUpdate}>
        <ThemedText style={{ color: primaryColor, fontSize: 16 }}>检查更新</ThemedText>
      </TouchableOpacity>
    )
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <ThemedText>当前版本</ThemedText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <ThemedText
          style={{ color: '#888' }}
          onPress={() => {
            const date = Updates.createdAt || new Date(buildDate)
            ToastAndroid.show(
              '发布时间：' +
                date.toLocaleDateString() +
                ' ' +
                date.toLocaleTimeString() +
                ' ' +
                gitHash,
              ToastAndroid.SHORT,
            )
          }}
        >
          {currentVersion}
        </ThemedText>
        {versionView()}
      </View>
    </View>
  )
}
