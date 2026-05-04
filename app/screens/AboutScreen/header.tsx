import { Image } from 'expo-image'
import React from 'react'
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native'

import { LoginModal } from '@/components/LoginModal'
import { ThemedButton } from '@/components/ThemedButton'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { useAuth } from '@/hooks/useAuth'

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
      <ThemedView style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.brandBlock}>
            <Image source={require('@/assets/images/icon.png')} style={styles.icon} />
            <View style={styles.brandTextBlock}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ThemedText type='title' style={{ fontSize: 24, lineHeight: 32 }}>
                  HotSou
                </ThemedText>
              </View>
              <ThemedText style={{ fontSize: 14, opacity: 0.6, fontWeight: '500' }}>
                主流热搜聚合
              </ThemedText>
            </View>
          </View>
          {isLoading ? (
            <ActivityIndicator size='small' />
          ) : isLoggedIn && email ? (
            <TouchableOpacity
              accessibilityRole='button'
              onPress={onLogoutPress}
              style={styles.accountEmailButton}
            >
              <ThemedText selectable style={styles.accountEmailText}>
                {email}
              </ThemedText>
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
  accountEmailButton: {
    flexShrink: 1,
    maxWidth: '48%',
    paddingLeft: 8,
    paddingVertical: 6,
  },
  accountEmailText: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 18,
    opacity: 0.8,
    textAlign: 'right',
    flex: 1,
  },
  brandBlock: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 16,
    minWidth: 0,
  },
  brandTextBlock: {
    flexShrink: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  container: {
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  icon: {
    borderRadius: 16,
    height: 60,
    width: 60,
  },
})
