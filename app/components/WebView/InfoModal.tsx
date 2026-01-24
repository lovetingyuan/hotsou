import * as Clipboard from 'expo-clipboard'
import React from 'react'
import {
  Linking,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native'

import { useColorScheme } from '@/hooks/useColorScheme'
import { useStore } from '@/store'

// import { FloatingButton } from '../FloatingButton'
import { ThemedButton } from '../ThemedButton'
import { ThemedText } from '../ThemedText'
import { ThemedView } from '../ThemedView'

export default function InfoModal(props: {
  visible: boolean
  title: string
  url: string
  closeModal: () => void
}) {
  const colorScheme = useColorScheme()
  const { $favorList, set$favorList } = useStore()

  const isFavorite = React.useMemo(() => {
    return $favorList.some(item => item.url === props.url)
  }, [$favorList, props.url])

  const toggleFavorite = () => {
    if (isFavorite) {
      set$favorList($favorList.filter(item => item.url !== props.url))
      ToastAndroid.show('已取消收藏', ToastAndroid.SHORT)
    } else {
      set$favorList([
        {
          title: props.title || '无标题',
          url: props.url,
          created_at: Date.now(),
        },
        ...$favorList,
      ])
      ToastAndroid.show('收藏成功', ToastAndroid.SHORT)
    }
    props.closeModal()
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={props.visible}
      statusBarTranslucent={true}
      onRequestClose={() => {
        props.closeModal()
      }}
    >
      <View style={styles.centeredView}>
        <ThemedView
          style={[styles.modalView, { shadowColor: colorScheme === 'dark' ? 'white' : 'black' }]}
        >
          <ThemedText style={{ fontWeight: 'bold', fontSize: 18 }} selectable>
            {props.title || '当前页面'}
          </ThemedText>
          <ScrollView style={{ maxHeight: 120 }}>
            <ThemedText selectable style={{ opacity: 0.7 }}>
              {props.url}
            </ThemedText>
          </ScrollView>

          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              marginTop: 20,
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
            }}
          >
            <ThemedButton
              title={isFavorite ? '取消收藏' : '收藏'}
              type={isFavorite ? 'secondary' : 'primary'}
              onPress={toggleFavorite}
            />
            <ThemedButton
              title="浏览器打开"
              onPress={() => {
                Linking.openURL(props.url)
                props.closeModal()
              }}
            />
            <ThemedButton
              title="分享"
              type="primary"
              onPress={() => {
                Share.share({
                  title: props.title,
                  message: props.title + '\n' + props.url,
                  url: props.url,
                })
                props.closeModal()
              }}
            />
            <ThemedButton
              title="复制链接"
              type="secondary"
              onPress={() => {
                Clipboard.setStringAsync(props.url).then(() => {
                  ToastAndroid.show('已复制', ToastAndroid.SHORT)
                })
                props.closeModal()
              }}
            />
          </View>
          <TouchableOpacity
            onPress={props.closeModal}
            style={{ position: 'absolute', top: 10, right: 10, padding: 5 }}
            hitSlop={10}
          >
            <ThemedText style={{ fontSize: 20, color: '#999' }}>✕</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    borderRadius: 10,
    paddingVertical: 25,
    paddingHorizontal: 20,
    width: '80%',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'column',
    gap: 20,
  },
})
