import React from 'react'
import { ScrollView } from 'react-native'

import AboutHeader from '@/components/about/header'
import TabListSetting from '@/components/about/TabListSetting'
import Version from '@/components/about/version'
import { ThemedView } from '@/components/ThemedView'

export default function About() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <ThemedView
        style={{ flex: 1, minHeight: '100%', paddingHorizontal: 20, paddingVertical: 30, gap: 20 }}
      >
        <AboutHeader></AboutHeader>
        <Version></Version>
        <TabListSetting></TabListSetting>
      </ThemedView>
    </ScrollView>
  )
}
