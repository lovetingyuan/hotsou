import React from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native'

import { ThemedButton } from '@/components/ThemedButton'
import { ThemedTextInput } from '@/components/ThemedInput'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useColorScheme } from '@/hooks/useColorScheme'
import { normalizeUrl } from '@/utils'

export interface FavoriteItem {
  title: string
  url: string
  created_at: number
}

export interface FavoriteModalProps {
  visible: boolean
  initialData?: FavoriteItem
  onClose: () => void
  onSave: (item: FavoriteItem) => void
  onDelete?: () => void
}

export function FavoriteModal(props: FavoriteModalProps) {
  const colorScheme = useColorScheme()
  const [title, setTitle] = React.useState('')
  const [url, setUrl] = React.useState('')
  const inputRef = React.useRef<TextInput>(null)

  React.useEffect(() => {
    if (props.visible) {
      if (props.initialData) {
        setTitle(props.initialData.title)
        setUrl(props.initialData.url)
      } else {
        setTitle('')
        setUrl('')
      }
    }
  }, [props.visible, props.initialData])

  const onShow = () => {
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  if (!props.visible) {
    return null
  }

  const handleSave = () => {
    if (!title.trim()) {
      ToastAndroid.show('标题不能为空', ToastAndroid.SHORT)
      return
    }
    const normalizedUrl = normalizeUrl(url.trim())
    if (!normalizedUrl) {
      ToastAndroid.show('网址不合法', ToastAndroid.SHORT)
      return
    }
    props.onSave({
      title: title.trim(),
      url: normalizedUrl,
      created_at: props.initialData?.created_at || Date.now(),
    })
    props.onClose()
  }

  const handleDelete = () => {
    Alert.alert('确认删除', '确定要删除这项收藏吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          props.onDelete?.()
          props.onClose()
        },
      },
    ])
  }

  const handleCancel = () => {
    props.onClose()
  }

  return (
    <Modal
      animationType='fade'
      transparent={true}
      visible={props.visible}
      statusBarTranslucent={true}
      onRequestClose={() => {
        props.onClose()
      }}
      onShow={onShow}
    >
      <KeyboardAvoidingView behavior='padding' style={styles.centeredView}>
        <ThemedView
          style={[styles.modalView, { shadowColor: colorScheme === 'dark' ? 'white' : 'black' }]}
        >
          <ThemedText style={{ fontWeight: 'bold', fontSize: 18 }}>
            {props.initialData ? '编辑收藏' : '添加收藏'}
          </ThemedText>
          <ThemedTextInput
            ref={inputRef}
            placeholder='标题'
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />
          <ThemedTextInput
            style={styles.input}
            placeholder='网址'
            inputMode='url'
            keyboardType='url'
            value={url}
            numberOfLines={3}
            multiline
            onChangeText={setUrl}
          />
          <View
            style={{ flexDirection: 'row', gap: 30, marginTop: 20, justifyContent: 'flex-end' }}
          >
            {props.initialData && props.onDelete && (
              <ThemedButton title='删除' type='danger' onPress={handleDelete}></ThemedButton>
            )}
            <ThemedButton title='取消' type='secondary' onPress={handleCancel}></ThemedButton>
            <ThemedButton title='保存' onPress={handleSave}></ThemedButton>
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  input: {
    borderBottomWidth: 1,
    paddingHorizontal: 4,
    fontSize: 16,
  },
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
    width: '70%',
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
