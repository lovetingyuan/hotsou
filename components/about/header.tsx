import React from 'react'
import { Image, Linking, Pressable, View } from 'react-native'

import { HelloWave } from '../HelloWave'
import { ThemedText } from '../ThemedText'
import { ThemedView } from '../ThemedView'

export default function AboutHeader() {
  const [helloKey, setHelloKey] = React.useState(1)

  return (
    <ThemedView style={{ gap: 16, marginTop: 20 }}>
      <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
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
    </ThemedView>
  )
}
