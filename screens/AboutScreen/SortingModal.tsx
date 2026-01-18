import React from 'react'
import {
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

export interface SortingModalProps {
  visible: boolean
  currentOrder: number
  maxOrder: number
  closeModal: () => void
  onConfirm: (newOrder: number) => void
}

export function SortingModal(props: SortingModalProps) {
  const [order, setOrder] = React.useState('')
  const inputRef = React.useRef<TextInput>(null)
  const colorScheme = useColorScheme()

  React.useEffect(() => {
    if (props.visible) {
      setOrder(String(props.currentOrder))
    }
  }, [props.visible, props.currentOrder])

  const onShow = () => {
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  if (!props.visible) return null

  const handleSave = () => {
    const newOrder = parseInt(order, 10)
    if (isNaN(newOrder) || newOrder < 1 || newOrder > props.maxOrder) {
      ToastAndroid.show(`请输入 1-${props.maxOrder} 之间的数字`, ToastAndroid.SHORT)
      return
    }
    props.onConfirm(newOrder)
    props.closeModal()
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={props.visible}
      statusBarTranslucent={true}
      onRequestClose={props.closeModal}
      onShow={onShow}
    >
      <KeyboardAvoidingView behavior="padding" style={styles.centeredView}>
        <ThemedView style={[styles.modalView, { shadowColor: colorScheme === 'dark' ? 'white' : 'black' }]}>
          <ThemedText style={{ fontWeight: 'bold', fontSize: 18 }}>调整排序</ThemedText>
          <ThemedText style={{ fontSize: 16 }}>当前位置: {props.currentOrder}</ThemedText>
          <ThemedTextInput
            ref={inputRef}
            placeholder={`请输入新位置 (1-${props.maxOrder})`}
            style={styles.input}
            value={order}
            onChangeText={setOrder}
            keyboardType="number-pad"
            maxLength={String(props.maxOrder).length + 1}
          />
          <View style={{ flexDirection: 'row', gap: 30, marginTop: 20, justifyContent: 'flex-end' }}>
            <ThemedButton title="取消" type="secondary" onPress={props.closeModal} />
            <ThemedButton title="确定" onPress={handleSave} />
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
