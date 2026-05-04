import * as Application from 'expo-application'
import * as Updates from 'expo-updates'
import React from 'react'
import { Alert, Linking, StyleSheet, ToastAndroid, TouchableOpacity, View } from 'react-native'

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
          style={styles.updateAction}
          onPress={() => {
            ToastAndroid.show('请在浏览器中下载并信任安装', ToastAndroid.SHORT)
          }}
        >
          <ThemedText style={[styles.statusText, styles.updateText]}>
            🎉 有更新：{latestVersion?.version} 点击下载⬇
          </ThemedText>
        </ExternalLink>
      ) : (
        <ThemedText style={styles.mutedStatusText}>暂无更新</ThemedText>
      )
    }
    return checking ? (
      <ThemedText style={[styles.mutedStatusText, styles.checkingText]}>⏳ 正在检查...</ThemedText>
    ) : (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={handleCheckAppUpdate}
        style={styles.updateAction}
      >
        <ThemedText style={[styles.statusText, { color: primaryColor }]}>检查更新</ThemedText>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.versionRow}>
      <ThemedText style={styles.versionLabel}>当前版本</ThemedText>
      <View style={styles.versionValueGroup}>
        <ThemedText
          style={styles.currentVersionText}
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

const styles = StyleSheet.create({
  checkingText: {
    fontStyle: 'italic',
  },
  currentVersionText: {
    color: '#888',
    flexShrink: 0,
    paddingRight: 2,
    textAlign: 'right',
    flex: 1,
  },
  mutedStatusText: {
    color: '#888',
    fontSize: 16,
  },
  statusText: {
    fontSize: 16,
  },
  updateAction: {
    flexShrink: 0,
    minWidth: 0,
  },
  updateText: {
    color: '#469b00',
    fontWeight: 'bold',
  },
  versionLabel: {
    flexShrink: 0,
    marginRight: 12,
  },
  versionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  versionValueGroup: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    minWidth: 0,
  },
})
