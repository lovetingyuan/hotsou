import React from 'react'
import { View } from 'react-native'

import { ExternalLink } from '../ExternalLink'
import { HelloWave } from '../HelloWave'
import ThemedIcon from '../ThemedIcon'
import { ThemedText } from '../ThemedText'
import { ThemedView } from '../ThemedView'

export default function AboutHeader() {
  const [helloKey, setHelloKey] = React.useState(1)
  return (
    <ThemedView style={{ gap: 16 }}>
      <ThemedView
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
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
        <ExternalLink href={'https://github.com/lovetingyuan/hotsou'} style={{ lineHeight: 40 }}>
          <ThemedIcon name="logo-github" size={26}></ThemedIcon>
        </ExternalLink>
      </ThemedView>
      <ThemedText>📣 聚合一些媒体的热搜热点信息，仅供展示和浏览，请勿轻易相信或传播。</ThemedText>
      <ThemedText>💡 如果使用过程中遇到问题，请及时更新版本。</ThemedText>
    </ThemedView>
  )
}
