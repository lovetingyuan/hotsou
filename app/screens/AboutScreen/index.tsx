import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { LayoutAnimation, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'

import { ExternalLink } from '@/components/ExternalLink'
import ThemedIcon from '@/components/ThemedIcon'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useColorScheme } from '@/hooks/useColorScheme'

import AboutHeader from './header'
import TabListSetting from './TabListSetting'
import TextSelectable from './TextSelectable'
import Version from './version'

function Section({ children, title }: { children: React.ReactNode; title?: string }) {
  const colorScheme = useColorScheme()
  return (
    <View style={styles.sectionContainer}>
      {title && (
        <ThemedText style={styles.sectionTitle} type='defaultSemiBold'>
          {title}
        </ThemedText>
      )}
      <View
        style={[
          styles.sectionContent,
          { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' },
        ]}
      >
        {children}
      </View>
    </View>
  )
}

function Disclaimer() {
  const [expanded, setExpanded] = React.useState(false)

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpanded(!expanded)
  }

  return (
    <View
      style={{
        gap: 10,
        opacity: 0.8,
      }}
    >
      <ThemedText
        style={{ fontSize: 16, lineHeight: 24 }}
        numberOfLines={expanded ? undefined : 2}
        ellipsizeMode='tail'
      >
        聚合一些媒体的热搜热点信息，仅供展示和浏览，请勿轻易相信或传播。{'\n'}
        所有数据均来自三方站点，与APP本身无关。{'\n'}
        如果使用过程中遇到问题，请及时更新版本。
      </ThemedText>

      <TouchableOpacity
        onPress={toggleExpand}
        activeOpacity={0.6}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: -5,
          alignSelf: 'flex-end',
        }}
      >
        <ThemedText style={{ fontSize: 14, color: '#007AFF' }}>
          {expanded ? '收起' : '展开更多'}
        </ThemedText>

        <ThemedIcon
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color='#007AFF'
          style={{ marginLeft: 4 }}
        />
      </TouchableOpacity>
    </View>
  )
}

function AboutScreen() {
  const navigation = useNavigation()
  const colorScheme = useColorScheme()
  const backgroundColor = colorScheme === 'dark' ? '#000' : '#f2f2f6'

  return (
    <ThemedView style={{ flex: 1, backgroundColor }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <AboutHeader>
          <Disclaimer />
        </AboutHeader>
        <View style={{ height: 20 }} />
        <Section title='常规设置'>
          <TextSelectable />
        </Section>

        <Section>
          <TabListSetting />
        </Section>

        <Section title='关于应用'>
          <Version />
          <ExternalLink href='https://github.com/lovetingyuan/hotsou'>
            <ThemedView
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <ThemedText>开源主页</ThemedText>
              <ThemedIcon name='logo-github' size={20} color='#888' />
            </ThemedView>
          </ExternalLink>
        </Section>
      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    marginLeft: 12,
    marginBottom: 8,
    fontSize: 13,
    opacity: 0.6,
    textTransform: 'uppercase',
  },
  sectionContent: {
    borderRadius: 12,
    overflow: 'hidden',
    padding: 16,
    gap: 16,
  },
})

export default AboutScreen
