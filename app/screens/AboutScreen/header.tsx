import { Image } from 'expo-image'
import React from 'react'
import { View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
export default function AboutHeader({ children }: { children?: React.ReactNode }) {
  return (
    <ThemedView
      style={{
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 20,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <Image
          source={require('@/assets/images/icon.png')}
          style={{ width: 60, height: 60, borderRadius: 16 }}
        />
        <View style={{ justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ThemedText type='title' style={{ fontSize: 24, lineHeight: 32 }}>
              HotSou
            </ThemedText>
          </View>
          <ThemedText style={{ fontSize: 14, opacity: 0.6, fontWeight: '500' }}>
            全网热搜聚合
          </ThemedText>
        </View>
      </View>
      {children}
    </ThemedView>
  )
}
