import React from 'react'
import { ScrollView } from 'react-native'

import AboutHeader from '@/components/about/header'
import TabListSetting from '@/components/about/TabListSetting'
import TextSelectable from '@/components/about/TextSelectable'
import Version from '@/components/about/version'
import { ThemedView } from '@/components/ThemedView'

function AboutScreen() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <ThemedView
        style={{ flex: 1, minHeight: '100%', paddingHorizontal: 20, paddingVertical: 30, gap: 20 }}
      >
        <AboutHeader></AboutHeader>
        <Version></Version>
        <TextSelectable />
        <TabListSetting></TabListSetting>
      </ThemedView>
    </ScrollView>
  )
}

export default AboutScreen
