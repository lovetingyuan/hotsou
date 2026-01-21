import React, { useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import ThemedIcon from '@/components/ThemedIcon'
import { ThemedTextInput } from '@/components/ThemedInput'
import { ThemedText } from '@/components/ThemedText'
import { ThemedButton } from '@/components/ThemedButton'
import { ThemedView } from '@/components/ThemedView'
import { useColorScheme } from '@/hooks/useColorScheme'
import { authApi, userApi } from '@/utils/api'
import { getStoreMethods, getStoreState } from '@/store'

function LoginScreen({ navigation }: any) {
  const colorScheme = useColorScheme()
  const { set$userEmail, set$authToken } = getStoreMethods()

  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [checkingRegistered, setCheckingRegistered] = useState(false)
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null)

  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('错误', '请输入有效的邮箱地址')
      return
    }

    setLoading(true)
    try {
      setCheckingRegistered(true)
      const registeredCheck = await authApi.checkRegistered(email)
      setIsRegistered(registeredCheck.registered)
      setCheckingRegistered(false)

      await authApi.requestOtp(email)
      setOtpSent(true)
      startCountdown()
      Alert.alert('成功', '验证码已发送到您的邮箱')
    } catch (error: any) {
      Alert.alert('错误', error.message || '发送验证码失败')
      setCheckingRegistered(false)
    } finally {
      setLoading(false)
    }
  }

  const startCountdown = () => {
    setCountdown(60)
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('错误', '请输入6位验证码')
      return
    }

    setLoading(true)
    try {
      const result = await authApi.verifyOtp(email, otp)

      if (result.success && result.token) {
        set$userEmail(email)
        set$authToken(result.token)

        if (!isRegistered) {
          handleFirstLogin(result.token)
        } else {
          handleExistingLogin(result.token)
        }
      } else {
        Alert.alert('错误', result.error || '验证失败')
      }
    } catch (error: any) {
      Alert.alert('错误', error.message || '验证失败')
    } finally {
      setLoading(false)
    }
  }

  const handleFirstLogin = async (token: string) => {
    try {
      const state = getStoreState() as any
      const syncData = {
        $tabsList: state.$tabsList,
        $enableTextSelect: state.$enableTextSelect,
      }

      await userApi.createData(email, token, syncData)
      Alert.alert('欢迎', '这是您第一次登录，您的本地数据已同步到服务器', [
        { text: '确定', onPress: () => navigation.goBack() },
      ])
    } catch (error: any) {
      Alert.alert('错误', error.message || '同步失败')
    }
  }

  const handleExistingLogin = (token: string) => {
    Alert.alert('数据选择', '您之前已登录过，请选择使用本地数据还是服务器数据', [
      {
        text: '使用本地数据',
        onPress: async () => {
          try {
            const state = getStoreState() as any
            const syncData = {
              $tabsList: state.$tabsList,
              $enableTextSelect: state.$enableTextSelect,
            }

            await userApi.updateData(email, token, syncData)
            Alert.alert('成功', '本地数据已同步到服务器')
            navigation.goBack()
          } catch (error: any) {
            Alert.alert('错误', error.message || '同步失败')
          }
        },
      },
      {
        text: '使用服务器数据',
        onPress: async () => {
          try {
            const response = await userApi.getData(email, token)

            if (response.success && response.result) {
              const methods = getStoreMethods()
              methods.set$tabsList(response.result.$tabsList)
              methods.set$enableTextSelect(response.result.$enableTextSelect)
              Alert.alert('成功', '服务器数据已下载到本地')
              navigation.goBack()
            }
          } catch (error: any) {
            Alert.alert('错误', error.message || '下载失败')
          }
        },
      },
    ])
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ThemedView
        style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#f2f2f6' }]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ThemedIcon name='arrow-back' size={24} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>登录</ThemedText>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>邮箱地址</ThemedText>
              <ThemedTextInput
                placeholder='请输入邮箱'
                value={email}
                onChangeText={setEmail}
                keyboardType='email-address'
                autoCapitalize='none'
                editable={!loading}
                style={styles.input}
              />
            </View>

            {otpSent && (
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>验证码</ThemedText>
                <ThemedTextInput
                  placeholder='请输入6位验证码'
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType='number-pad'
                  maxLength={6}
                  editable={!loading}
                  style={styles.input}
                />
              </View>
            )}

            {!otpSent ? (
              <ThemedButton
                title={loading ? (checkingRegistered ? '检查中...' : '发送中...') : '发送验证码'}
                onPress={handleSendOtp}
                disabled={loading || countdown > 0}
                style={styles.button}
              />
            ) : (
              <View style={styles.verifyContainer}>
                <ThemedButton
                  title='验证'
                  onPress={handleVerifyOtp}
                  disabled={loading || otp.length !== 6}
                  style={{ ...styles.button, flex: 1 } as any}
                />
                {countdown > 0 ? (
                  <ThemedText style={styles.countdown}>{countdown}秒后重试</ThemedText>
                ) : (
                  <TouchableOpacity
                    onPress={handleSendOtp}
                    disabled={loading}
                    style={styles.resendButton}
                  >
                    <ThemedText style={styles.resendText}>重新发送</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <View style={styles.tipContainer}>
              <Ionicons
                name='information-circle-outline'
                size={16}
                color={colorScheme === 'dark' ? '#888' : '#666'}
              />
              <ThemedText style={styles.tipText}>验证码有效期为5分钟</ThemedText>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  formContainer: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    width: '100%',
  },
  button: {
    marginTop: 8,
  },
  verifyContainer: {
    gap: 12,
    marginTop: 8,
  },
  countdown: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.6,
  },
  resendButton: {
    padding: 12,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  tipText: {
    fontSize: 12,
    opacity: 0.6,
  },
})

export default LoginScreen
