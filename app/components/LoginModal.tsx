import React, { useCallback, useEffect, useRef, useState } from 'react'
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
import { useThemeColor } from '@/hooks/useThemeColor'
import { normalizeAuthEmail } from '@/utils/authEmail'

type ModalStep = 'email' | 'otp'

export interface LoginModalProps {
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

export function LoginModal({
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
  const [hasAcceptedAlert, setHasAcceptedAlert] = useState(mode !== 'reauth')

  const emailInputRef = useRef<TextInput>(null)
  const otpInputRef = useRef<TextInput>(null)
  const colorScheme = useColorScheme()
  const primaryColor = useThemeColor({}, 'primary')
  const onCloseRef = useRef(onClose)
  const onSendOtpRef = useRef(onSendOtp)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    onSendOtpRef.current = onSendOtp
  }, [onSendOtp])

  const handleSendOtpInternal = useCallback(async (emailToSend: string) => {
    const normalizedEmail = normalizeAuthEmail(emailToSend)

    setLoading(true)
    setError('')
    setEmail(normalizedEmail)

    const result = await onSendOtpRef.current(normalizedEmail)

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
  }, [])

  // 重置状态
  useEffect(() => {
    if (visible) {
      setStep(mode === 'reauth' ? 'otp' : 'email')
      setEmail(initialEmail || '')
      setOtp('')
      setError('')
      setLoading(false)
      // reauth 模式下询问用户是否发送验证码
      if (mode === 'reauth' && initialEmail) {
        setHasAcceptedAlert(false)
        Alert.alert('登录已过期', `是否向 ${initialEmail} 发送验证码重新登录？`, [
          { text: '取消', style: 'cancel', onPress: () => onCloseRef.current() },
          {
            text: '确定',
            onPress: () => {
              setHasAcceptedAlert(true)
              handleSendOtpInternal(initialEmail)
            },
          },
        ])
      } else {
        setHasAcceptedAlert(true)
      }
    } else {
      setHasAcceptedAlert(false)
    }
  }, [visible, mode, initialEmail, handleSendOtpInternal])

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

  const handleSendOtp = async () => {
    const normalizedEmail = normalizeAuthEmail(email)

    if (!validateEmail(normalizedEmail)) {
      ToastAndroid.show('邮箱格式不正确', ToastAndroid.SHORT)
      return
    }
    await handleSendOtpInternal(normalizedEmail)
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

    const normalizedEmail = normalizeAuthEmail(email)
    setEmail(normalizedEmail)

    const result = await onVerifyOtp(normalizedEmail, otp)

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

  if (!visible || !hasAcceptedAlert) {
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
                    <ThemedText style={{ fontSize: 12, color: primaryColor }}>
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
