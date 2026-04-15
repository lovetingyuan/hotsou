import { Image } from 'expo-image'
import React from 'react'
import { ActivityIndicator, Alert, TouchableOpacity, View } from 'react-native'

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
                主流热搜聚合
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
