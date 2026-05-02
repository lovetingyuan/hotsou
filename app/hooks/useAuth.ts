import { useCallback, useEffect, useState } from 'react'

import * as authApi from '@/api/auth'
import { getStoreMethods, getStoreState, useStore } from '@/store'
import { normalizeAuthEmail } from '@/utils/authEmail'
import { clearLocalSyncData } from '@/utils/clearSyncData'
import { clearAuthData, clearToken, getAuthData, setAuthData } from '@/utils/secureStore'

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
  checkRegistered: (email: string) => Promise<authApi.CheckRegisteredResponse>
  // 退出登录
  handleLogout: () => Promise<void>
  // 刷新状态
  refreshAuthState: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const { isLogin } = useStore()
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

      // 有邮箱和 token，登录态以后续全局校验结果为准
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isLoggedIn: getStoreState().isLogin,
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
    setState((prev) => ({
      ...prev,
      isLoggedIn: isLogin,
      token: isLogin ? prev.token : null,
    }))
  }, [isLogin])

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
      const normalizedEmail = normalizeAuthEmail(email)

      // 验证成功，保存认证数据
      await setAuthData(normalizedEmail, result.token)
      getStoreMethods().setIsLogin(true)
      setState((prev) => ({
        ...prev,
        isLoggedIn: true,
        email: normalizedEmail,
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

  const checkRegistered = async (email: string): Promise<authApi.CheckRegisteredResponse> => {
    return authApi.checkRegistered(email)
  }

  /**
   * 退出登录
   */
  const handleLogout = async () => {
    const { email, token } = await getAuthData()

    // 先清除本地状态，避免网络卡住时延迟退出或跨账号复用同步数据。
    await clearAuthData()
    await clearLocalSyncData()
    getStoreMethods().setIsLogin(false)

    if (email && token) {
      void authApi.logout(email, token)
    }

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
    checkRegistered,
    handleLogout,
    refreshAuthState,
  }
}
