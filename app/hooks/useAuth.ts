import { useCallback, useEffect, useState } from 'react'

import * as authApi from '@/api/auth'
import {
  clearAuthData,
  clearToken,
  getAuthData,
  setAuthData,
  updateToken,
} from '@/utils/secureStore'

export interface AuthState {
  isLoading: boolean
  isLoggedIn: boolean
  email: string | null
  // 弹窗控制
  showLoginModal: boolean
  showReAuthModal: boolean
}

export interface UseAuthReturn extends AuthState {
  // 弹窗控制
  openLoginModal: () => void
  closeLoginModal: () => void
  closeReAuthModal: () => void
  // 登录流程
  handleSendOtp: (email: string) => Promise<authApi.OtpResponse>
  handleVerifyOtp: (email: string, otp: string) => Promise<authApi.VerifyResponse>
  // 退出登录
  handleLogout: () => void
  // 刷新状态
  refreshAuthState: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isLoggedIn: false,
    email: null,
    showLoginModal: false,
    showReAuthModal: false,
  })

  /**
   * 初始化：从 SecureStore 读取认证数据并检查状态
   */
  const initAuth = useCallback(async () => {
    try {
      const { email, token } = await getAuthData()

      if (!email) {
        // 没有邮箱信息，未登录状态
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isLoggedIn: false,
          email: null,
        }))
        return
      }

      if (!token) {
        // 有邮箱但没有 token，需要重新验证
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isLoggedIn: false,
          email: email,
          showReAuthModal: true,
        }))
        return
      }

      // 有邮箱和 token，检查登录状态
      const statusResult = await authApi.checkAuthStatus(email, token)

      if (statusResult.valid) {
        // 登录有效
        if (statusResult.newToken) {
          // 需要刷新 token
          await updateToken(statusResult.newToken)
        }
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isLoggedIn: true,
          email: email,
        }))
      } else {
        // 登录无效（token 过期），弹出重新验证弹窗
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isLoggedIn: false,
          email: email,
          showReAuthModal: true,
        }))
      }
    } catch (error) {
      console.error('[useAuth] initAuth error:', error)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isLoggedIn: false,
      }))
    }
  }, [])

  useEffect(() => {
    initAuth()
  }, [initAuth])

  /**
   * 打开登录弹窗
   */
  const openLoginModal = useCallback(() => {
    setState((prev) => ({ ...prev, showLoginModal: true }))
  }, [])

  /**
   * 关闭登录弹窗
   */
  const closeLoginModal = useCallback(() => {
    setState((prev) => ({ ...prev, showLoginModal: false }))
  }, [])

  /**
   * 关闭重新验证弹窗
   */
  const closeReAuthModal = useCallback(() => {
    setState((prev) => ({ ...prev, showReAuthModal: false }))
  }, [])

  /**
   * 发送验证码
   */
  const handleSendOtp = useCallback(async (email: string): Promise<authApi.OtpResponse> => {
    return authApi.sendOtp(email)
  }, [])

  /**
   * 验证验证码
   */
  const handleVerifyOtp = useCallback(
    async (email: string, otp: string): Promise<authApi.VerifyResponse> => {
      const result = await authApi.verifyOtp(email, otp)

      if (result.success && result.token) {
        // 验证成功，保存认证数据
        await setAuthData(email, result.token)
        setState((prev) => ({
          ...prev,
          isLoggedIn: true,
          email: email,
          showLoginModal: false,
          showReAuthModal: false,
        }))
      } else {
        // 验证失败，清除 token 但保留 email
        await clearToken()
      }

      return result
    },
    [],
  )

  /**
   * 退出登录
   */
  const handleLogout = useCallback(async () => {
    const { email, token } = await getAuthData()

    if (email && token) {
      // 调用退出登录接口
      await authApi.logout(email, token)
    }

    // 清除本地认证数据
    await clearAuthData()

    setState((prev) => ({
      ...prev,
      isLoggedIn: false,
      email: null,
    }))
  }, [])

  /**
   * 刷新认证状态
   */
  const refreshAuthState = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }))
    await initAuth()
  }, [initAuth])

  return {
    ...state,
    openLoginModal,
    closeLoginModal,
    closeReAuthModal,
    handleSendOtp,
    handleVerifyOtp,
    handleLogout,
    refreshAuthState,
  }
}
