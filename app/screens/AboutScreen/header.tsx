import { Image } from 'expo-image'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
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
import { useAuth } from '@/hooks/useAuth'
import { useColorScheme } from '@/hooks/useColorScheme'

type ModalStep = 'email' | 'otp'

interface LoginModalProps {
  visible: boolean
  onClose: () => void
  mode: 'login' | 'reauth'
  initialEmail?: string | null
  onSendOtp: (email: string) => Promise<{ success: boolean; error?: string; waitSeconds?: number }>
  onVerifyOtp: (
    email: string,
    otp: string,
  ) => Promise<{ success: boolean; error?: string; token?: string }>
}

function LoginModal({
  visible,
  onClose,
  mode,
  initialEmail,
  onSendOtp,
  onVerifyOtp,
}: LoginModalProps) {
  const [step, setStep] = useState<ModalStep>(mode === 'reauth' ? 'otp' : 'email')
  const [email, setEmail] = useState(initialEmail || '')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')

  const emailInputRef = useRef<TextInput>(null)
  const otpInputRef = useRef<TextInput>(null)
  const colorScheme = useColorScheme()

  // 重置状态
  useEffect(() => {
    if (visible) {
      setStep(mode === 'reauth' ? 'otp' : 'email')
      setEmail(initialEmail || '')
      setOtp('')
      setError('')
      setLoading(false)
      // reauth 模式下自动发送验证码
      if (mode === 'reauth' && initialEmail) {
        handleSendOtpInternal(initialEmail)
      }
    }
  }, [visible, mode, initialEmail])

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const onShow = () => {
    setTimeout(() => {
      if (step === 'email') {
        emailInputRef.current?.focus()
      } else {
        otpInputRef.current?.focus()
      }
    }, 100)
  }

  const validateEmail = (emailToValidate: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(emailToValidate)
  }

  const handleSendOtpInternal = async (emailToSend: string) => {
    setLoading(true)
    setError('')

    const result = await onSendOtp(emailToSend)

    setLoading(false)

    if (result.success) {
      setStep('otp')
      setCountdown(60)
      ToastAndroid.show('验证码已发送', ToastAndroid.SHORT)
      setTimeout(() => otpInputRef.current?.focus(), 100)
    } else {
      if (result.waitSeconds) {
        setCountdown(result.waitSeconds)
        setStep('otp')
      }
      setError(result.error || '发送验证码失败')
    }
  }

  const handleSendOtp = async () => {
    if (!validateEmail(email)) {
      ToastAndroid.show('邮箱格式不正确', ToastAndroid.SHORT)
      return
    }
    await handleSendOtpInternal(email)
  }

  const handleResendOtp = async () => {
    if (countdown > 0) {
      return
    }
    await handleSendOtpInternal(email)
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      ToastAndroid.show('请输入6位验证码', ToastAndroid.SHORT)
      return
    }

    setLoading(true)
    setError('')

    const result = await onVerifyOtp(email, otp)

    setLoading(false)

    if (result.success) {
      ToastAndroid.show('登录成功', ToastAndroid.SHORT)
      onClose()
    } else {
      setError(result.error || '验证码错误')
      setOtp('')
    }
  }

  const handleCancel = () => {
    setEmail('')
    setOtp('')
    setError('')
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
      statusBarTranslucent
      onRequestClose={handleCancel}
      onShow={onShow}
    >
      <KeyboardAvoidingView behavior='padding' style={styles.centeredView}>
        <ThemedView
          style={[styles.modalView, { shadowColor: colorScheme === 'dark' ? 'white' : 'black' }]}
        >
          <ThemedText style={{ fontWeight: 'bold', fontSize: 18 }}>
            {mode === 'reauth' ? '验证登录' : '登录'}
          </ThemedText>

          {step === 'email' && (
            <>
              <ThemedTextInput
                ref={emailInputRef}
                placeholder='请输入邮箱'
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType='email-address'
                autoCapitalize='none'
                editable={!loading}
              />
            </>
          )}

          {step === 'otp' && (
            <>
              <ThemedText style={{ fontSize: 14, opacity: 0.7 }}>验证码已发送至 {email}</ThemedText>
              <ThemedTextInput
                ref={otpInputRef}
                placeholder='请输入6位验证码'
                style={styles.input}
                value={otp}
                onChangeText={(text) => setOtp(text.replace(/\D/g, '').slice(0, 6))}
                keyboardType='number-pad'
                maxLength={6}
                editable={!loading}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {countdown > 0 ? (
                  <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>
                    {countdown}秒后可重新发送
                  </ThemedText>
                ) : (
                  <TouchableOpacity onPress={handleResendOtp} disabled={loading}>
                    <ThemedText style={{ fontSize: 12, color: '#007bff' }}>
                      重新发送验证码
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {error ? (
            <ThemedText style={{ fontSize: 12, color: '#dc3545' }}>{error}</ThemedText>
          ) : null}

          <View
            style={{ flexDirection: 'row', gap: 30, marginTop: 10, justifyContent: 'flex-end' }}
          >
            <ThemedButton title='取消' type='secondary' onPress={handleCancel} disabled={loading} />
            {step === 'email' && (
              <ThemedButton
                title={loading ? '发送中...' : '发送验证码'}
                onPress={handleSendOtp}
                disabled={loading}
              />
            )}
            {step === 'otp' && (
              <ThemedButton
                title={loading ? '验证中...' : '验证'}
                onPress={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
              />
            )}
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  )
}

export default function AboutHeader({ children }: { children?: React.ReactNode }) {
  const {
    isLoading,
    isLoggedIn,
    email,
    showLoginModal,
    showReAuthModal,
    openLoginModal,
    closeLoginModal,
    closeReAuthModal,
    handleSendOtp,
    handleVerifyOtp,
    handleLogout,
  } = useAuth()

  const onLogoutPress = () => {
    Alert.alert('退出登录', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        onPress: handleLogout,
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
          {isLoading ? (
            <ActivityIndicator size='small' />
          ) : isLoggedIn && email ? (
            <TouchableOpacity onPress={onLogoutPress}>
              <ThemedText style={{ fontSize: 14, opacity: 0.8 }}>{email}</ThemedText>
            </TouchableOpacity>
          ) : (
            <ThemedButton title='登录' onPress={openLoginModal} />
          )}
        </View>
        {children}
      </ThemedView>

      {/* 正常登录弹窗 */}
      <LoginModal
        visible={showLoginModal}
        onClose={closeLoginModal}
        mode='login'
        onSendOtp={handleSendOtp}
        onVerifyOtp={handleVerifyOtp}
      />

      {/* Token 过期重新验证弹窗 */}
      <LoginModal
        visible={showReAuthModal}
        onClose={closeReAuthModal}
        mode='reauth'
        initialEmail={email}
        onSendOtp={handleSendOtp}
        onVerifyOtp={handleVerifyOtp}
      />
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
