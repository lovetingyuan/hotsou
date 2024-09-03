import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import * as Application from 'expo-application'
import React from 'react'
import { Linking, Text, ToastAndroid, View } from 'react-native'

const owner = process.env.EXPO_PUBLIC_GITHUB_USER
const repo = process.env.EXPO_PUBLIC_GITHUB_REPO
const url = `https://api.github.com/repos/${owner}/${repo}/releases`

function checkAppUpdate() {
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        response.text().then(r => {
          __DEV__ && console.log('error:' + r)
        })
        throw new Error('Network response was not ok')
      }
      return response.json()
      // return [
      //   {
      //     assets: [
      //       {
      //         browser_download_url:
      //           'https://github.com/lovetingyuan/hotsou/releases/download/v1.0.0/hotsou-1.0.0.apk',
      //         content_type: 'application/vnd.android.package-archive',
      //         created_at: '2024-09-03T10:09:11Z',
      //         download_count: 1,
      //         id: 190075111,
      //         label: null,
      //         name: 'hotsou-1.0.0.apk',
      //         node_id: 'RA_kwDOMqmLs84LVFDn',
      //         size: 73023396,
      //         state: 'uploaded',
      //         updated_at: '2024-09-03T10:09:35Z',
      //         url: 'https://api.github.com/repos/lovetingyuan/hotsou/releases/assets/190075111',
      //       },
      //     ],
      //     assets_url: 'https://api.github.com/repos/lovetingyuan/hotsou/releases/173181158/assets',
      //     author: {
      //       avatar_url: 'https://avatars.githubusercontent.com/u/7310471?v=4',
      //       events_url: 'https://api.github.com/users/lovetingyuan/events{/privacy}',
      //       followers_url: 'https://api.github.com/users/lovetingyuan/followers',
      //       following_url: 'https://api.github.com/users/lovetingyuan/following{/other_user}',
      //       gists_url: 'https://api.github.com/users/lovetingyuan/gists{/gist_id}',
      //       gravatar_id: '',
      //       html_url: 'https://github.com/lovetingyuan',
      //       id: 7310471,
      //       login: 'lovetingyuan',
      //       node_id: 'MDQ6VXNlcjczMTA0NzE=',
      //       organizations_url: 'https://api.github.com/users/lovetingyuan/orgs',
      //       received_events_url: 'https://api.github.com/users/lovetingyuan/received_events',
      //       repos_url: 'https://api.github.com/users/lovetingyuan/repos',
      //       site_admin: false,
      //       starred_url: 'https://api.github.com/users/lovetingyuan/starred{/owner}{/repo}',
      //       subscriptions_url: 'https://api.github.com/users/lovetingyuan/subscriptions',
      //       type: 'User',
      //       url: 'https://api.github.com/users/lovetingyuan',
      //     },
      //     body: 'initial release',
      //     created_at: '2024-09-03T10:08:35Z',
      //     draft: false,
      //     html_url: 'https://github.com/lovetingyuan/hotsou/releases/tag/v1.0.0',
      //     id: 173181158,
      //     name: 'v1.0.0',
      //     node_id: 'RE_kwDOMqmLs84KUojm',
      //     prerelease: false,
      //     published_at: '2024-09-03T10:09:45Z',
      //     tag_name: 'v1.0.0',
      //     tarball_url: 'https://api.github.com/repos/lovetingyuan/hotsou/tarball/v1.0.0',
      //     target_commitish: 'main',
      //     upload_url:
      //       'https://uploads.github.com/repos/lovetingyuan/hotsou/releases/173181158/assets{?name,label}',
      //     url: 'https://api.github.com/repos/lovetingyuan/hotsou/releases/173181158',
      //     zipball_url: 'https://api.github.com/repos/lovetingyuan/hotsou/zipball/v1.0.0',
      //   },
      // ]
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
      __DEV__ && console.error('There was a problem with the fetch operation:', error)
    })
}

export default function About() {
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
  return (
    <ThemedView style={{ flex: 1, padding: 20, gap: 20 }}>
      <ThemedText style={{ fontSize: 20 }}>欢迎使用本应用</ThemedText>
      <ThemedText>聚合一些媒体的热搜热点，仅供展示和浏览</ThemedText>
      <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center' }}>
        <ThemedText>当前版本：{currentVersion}</ThemedText>
        {latestVersion ? (
          latestVersion.version !== currentVersion ? (
            <Text
              style={{ fontSize: 16, color: '#469b00', fontWeight: 'bold' }}
              onPress={() => {
                Linking.openURL(latestVersion.downloadUrl)
              }}
            >
              有更新：{latestVersion.version} 点击下载
            </Text>
          ) : (
            <Text style={{ fontSize: 16 }}>暂无更新</Text>
          )
        ) : checking ? (
          <Text style={{ fontSize: 16 }}>正在检查...</Text>
        ) : (
          <Text style={{ color: '#0065da', fontSize: 16 }} onPress={handleCheckAppUpdate}>
            检查更新
          </Text>
        )}
      </View>
    </ThemedView>
  )
}
