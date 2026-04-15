import { useCallback, useEffect, useState } from 'react'

import * as authApi from '@/api/auth'
import { getStoreMethods } from '@/store'
import {
  clearAuthData,
  clearToken,
  getAuthData,
  setAuthData,
} from '@/utils/secureStore'

export interface AuthState {
  isLoading: boolean
  isLoggedIn: boolean
  email: string | null
  token: string | null
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
  handleLogout: () => Promise<void>
  // 刷新状态
  refreshAuthState: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isLoggedIn: false,
    email: null,
    token: null,
    showLoginModal: false,
    showReAuthModal: false,
  })

  /**
   * 初始化：从 SecureStore 读取认证数据（不调用 checkAuthStatus，由 InitApp 负责启动时验证）
   */
  const initAuth = useCallback(async () => {
    try {
      const { email, token } = await getAuthData()

      if (!email) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isLoggedIn: false,
          email: null,
          token: null,
        }))
        return
      }

      if (!token) {
        // 有邮箱但没有 token，需要重新验证（InitApp 已经会弹窗，这里只同步状态）
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isLoggedIn: false,
          email: email,
          token: null,
        }))
        return
      }

      // 有邮箱和 token，信任 InitApp 的验证结果
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isLoggedIn: true,
        email: email,
        token: token,
      }))
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

  useEffect(() => {
    getStoreMethods().setIsLogin(state.isLoggedIn)
  }, [state.isLoggedIn])

  /**
   * 打开登录弹窗
   */
  const openLoginModal = () => {
    setState((prev) => ({ ...prev, showLoginModal: true }))
  }

  /**
   * 关闭登录弹窗
   */
  const closeLoginModal = () => {
    setState((prev) => ({ ...prev, showLoginModal: false }))
  }

  /**
   * 关闭重新验证弹窗
   */
  const closeReAuthModal = () => {
    setState((prev) => ({ ...prev, showReAuthModal: false }))
  }

  /**
   * 发送验证码
   */
  const handleSendOtp = async (email: string): Promise<authApi.OtpResponse> => {
    return authApi.sendOtp(email)
  }

  /**
   * 验证验证码
   */
  const handleVerifyOtp = async (email: string, otp: string): Promise<authApi.VerifyResponse> => {
    const result = await authApi.verifyOtp(email, otp)

    if (result.success && result.token) {
      // 验证成功，保存认证数据
      await setAuthData(email, result.token)
      setState((prev) => ({
        ...prev,
        isLoggedIn: true,
        email: email,
        token: result.token as string,
        showLoginModal: false,
        showReAuthModal: false,
      }))
    } else {
      // 验证失败，清除 token 但保留 email
      await clearToken()
    }

    return result
  }

  /**
   * 退出登录
   */
  const handleLogout = async () => {
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
      token: null,
    }))
  }

  /**
   * 刷新认证状态
   */
  const refreshAuthState = async () => {
    setState((prev) => ({ ...prev, isLoading: true }))
    await initAuth()
  }

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
