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
import { useStore } from '@/store'
import { isHttpUrl } from '@/utils'

export interface EditingModalProps {
  name: string
  visible: boolean
  isAdding: boolean
  closeModal: () => void
}

export function EditingModal(props: EditingModalProps) {
  const { get$tabsList, set$tabsList } = useStore()
  const colorScheme = useColorScheme()
  const tabList = get$tabsList()
  const tab = tabList.find(v => v.name === props.name)
  const [title, setTitle] = React.useState('')
  const [url, setUrl] = React.useState('')
  const inputRef = React.useRef<TextInput>(null)

  React.useEffect(() => {
    if (props.visible) {
      if (props.isAdding) {
        setTitle('')
        setUrl('')
      } else if (tab) {
        setTitle(tab.title)
        setUrl(tab.url)
      }
    }
  }, [props.visible, props.isAdding, tab])

  const onShow = () => {
    // Delay to ensure modal is visible and animation is done
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  if (!props.visible) {
    return null
  }

  const handleSaveSub = () => {
    if (!title.trim()) {
      ToastAndroid.show('名称不能为空', ToastAndroid.SHORT)
      return
    }
    // Check for duplicate titles in the current list
    const currentList = get$tabsList()
    if (
      currentList.find(v => v.title === title.trim() && (props.isAdding || v.name !== props.name))
    ) {
      ToastAndroid.show('请换一个名称', ToastAndroid.SHORT)
      return
    }
    if (!url.trim()) {
      ToastAndroid.show('网址不能为空', ToastAndroid.SHORT)
      return
    }
    if (!isHttpUrl(url.trim())) {
      ToastAndroid.show('网址不合法', ToastAndroid.SHORT)
      return
    }
    set$tabsList(list => {
      const newList = [...list]
      if (props.isAdding) {
        newList.push({
          name: `custom_${Date.now()}`,
          title: title.trim(),
          url: url.trim(),
          show: true,
          builtIn: false,
          icon: '', // Optional: add default icon or allow user to input
        } as any)
      } else {
        const index = newList.findIndex(v => v.name === props.name)
        if (index >= 0) {
          newList[index] = {
            ...newList[index],
            title: title.trim(),
            url: url.trim(),
            show: true,
            builtIn: false,
            icon: '', // Optional: add default icon or allow user to input
          }
        }
      }
      return newList
    })
    props.closeModal()
  }

  const handleDelete = () => {
    Alert.alert('确认删除', '确定要删除这个站点吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          set$tabsList(list => list.filter(v => v.name !== props.name))
          props.closeModal()
        },
      },
    ])
  }

  const handleCancel = () => {
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
      onShow={onShow}
    >
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.centeredView}
      >
        <ThemedView
          style={[styles.modalView, { shadowColor: colorScheme === 'dark' ? 'white' : 'black' }]}
        >
          <ThemedText style={{ fontWeight: 'bold', fontSize: 18 }}>
            {props.isAdding ? '添加站点' : '编辑站点'}
          </ThemedText>
          <ThemedTextInput
            ref={inputRef}
            placeholder="名称"
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />
          <ThemedTextInput
            style={styles.input}
            placeholder="网址(http完整地址)"
            inputMode="url"
            keyboardType="url"
            value={url}
            numberOfLines={3}
            multiline
            onChangeText={setUrl}
          />
          <View
            style={{ flexDirection: 'row', gap: 30, marginTop: 20, justifyContent: 'flex-end' }}
          >
            {!props.isAdding && !tab?.builtIn && (
              <ThemedButton title="删除" type="danger" onPress={handleDelete}></ThemedButton>
            )}
            <ThemedButton title="取消" type="secondary" onPress={handleCancel}></ThemedButton>
            <ThemedButton title="保存" onPress={handleSaveSub}></ThemedButton>
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
