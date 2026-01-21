import { Image } from 'expo-image'
import React, { useRef, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native'

import { ThemedButton } from '@/components/ThemedButton'
import { ThemedTextInput } from '@/components/ThemedInput'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useColorScheme } from '@/hooks/useColorScheme'
import { getStoreMethods, useStore, getStoreState } from '@/store'
import { openapi } from '@/api/openapi'
import { UserApplicationData } from '@/api/openapi'

function LoginModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('')
  const inputRef = useRef<TextInput>(null)
  const colorScheme = useColorScheme()

  const onShow = () => {
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const handleConfirm = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      ToastAndroid.show('邮箱格式不正确', ToastAndroid.SHORT)
      return
    }
    console.log(9999, 333, email)

    try {
      const response = await openapi.getUserApplicationData(email)
      console.log(9999, 333, response)

      if (!response.success || !response.result) {
        const { $tabsList, $enableTextSelect } = getStoreState()
        const userData: UserApplicationData = {
          $tabsList: $tabsList,
          $enableTextSelect: $enableTextSelect,
        }
        await openapi.createUserApplicationData(email, userData)

        Alert.alert('注册成功', `您的邮箱 ${email} 已经接收到了注册邮件，请保存好其中的恢复码。`, [
          {
            text: '确定',
            onPress: () => {
              const methods = getStoreMethods()
              methods.set$userEmail(email)
              setEmail('')
              onClose()
            },
          },
        ])
      } else {
        const methods = getStoreMethods()
        methods.set$userEmail(email)
        setEmail('')
        onClose()
      }
    } catch (error: any) {
      ToastAndroid.show(error.message || '登录失败，请重试', ToastAndroid.SHORT)
    }
  }

  const handleCancel = () => {
    setEmail('')
    onClose()
  }

  if (!visible) {
    return null
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onClose}
      onShow={onShow}
    >
      <KeyboardAvoidingView behavior='padding' style={styles.centeredView}>
        <ThemedView
          style={[styles.modalView, { shadowColor: colorScheme === 'dark' ? 'white' : 'black' }]}
        >
          <ThemedText style={{ fontWeight: 'bold', fontSize: 18 }}>登录</ThemedText>
          <ThemedTextInput
            ref={inputRef}
            placeholder='请输入邮箱'
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType='email-address'
            autoCapitalize='none'
          />
          <View
            style={{ flexDirection: 'row', gap: 30, marginTop: 20, justifyContent: 'flex-end' }}
          >
            <ThemedButton title='取消' type='secondary' onPress={handleCancel} />
            <ThemedButton title='确定' onPress={handleConfirm} />
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  )
}

export default function AboutHeader({ children }: { children?: React.ReactNode }) {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { $userEmail, set$userEmail } = useStore()

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        onPress: () => {
          set$userEmail('')
        },
      },
    ])
  }

  return (
    <>
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
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
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
          {$userEmail ? (
            <TouchableOpacity onPress={handleLogout}>
              <ThemedText style={{ fontSize: 14, opacity: 0.8 }}>{$userEmail}</ThemedText>
            </TouchableOpacity>
          ) : (
            <ThemedButton title='登录' onPress={() => setShowLoginModal(true)} />
          )}
        </View>
        {children}
      </ThemedView>
      <LoginModal visible={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
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
