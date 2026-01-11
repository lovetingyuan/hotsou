import React from 'react'
import { NestableScrollContainer } from 'react-native-draggable-flatlist'

import AboutHeader from '@/components/about/header'
import TabListSetting from '@/components/about/TabListSetting'
import TextSelectable from '@/components/about/TextSelectable'
import Version from '@/components/about/version'
import { ThemedView } from '@/components/ThemedView'

function AboutScreen() {
  return (
    <NestableScrollContainer style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <ThemedView
        style={{ flex: 1, minHeight: '100%', paddingHorizontal: 20, paddingVertical: 30, gap: 20 }}
      >
        <AboutHeader></AboutHeader>
        <Version></Version>
        <TextSelectable />
        <TabListSetting></TabListSetting>
      </ThemedView>
    </NestableScrollContainer>
  )
}

export default AboutScreen
