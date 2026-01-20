import { Image } from 'expo-image'
import React, { useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { getStoreMethods, useStore } from '@/store'
import { useColorScheme } from '@/hooks/useColorScheme'
function LoginModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('')
  const colorScheme = useColorScheme()

  const handleConfirm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return
    }
    const methods = getStoreMethods()
    methods.set$userEmail(email)
    setEmail('')
    onClose()
  }

  const handleCancel = () => {
    setEmail('')
    onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <Pressable
          style={[
            styles.modalContent,
            { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <ThemedText type="defaultSemiBold" style={styles.modalTitle}>登录</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colorScheme === 'dark' ? '#2c2c2e' : '#f2f2f6',
                color: colorScheme === 'dark' ? '#fff' : '#000',
                borderColor: colorScheme === 'dark' ? '#3a3a3c' : '#e5e5ea'
              }
            ]}
            placeholder="请输入邮箱"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.buttonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>确定</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

export default function AboutHeader({ children }: { children?: React.ReactNode }) {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { $userEmail } = useStore()

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
            <ThemedText style={{ fontSize: 14, opacity: 0.8 }}>{$userEmail}</ThemedText>
          ) : (
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => setShowLoginModal(true)}
            >
              <ThemedText style={styles.loginButtonText}>登录</ThemedText>
            </TouchableOpacity>
          )}
        </View>
        {children}
      </ThemedView>
      <LoginModal visible={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 24,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e5e5ea',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  loginButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
})
