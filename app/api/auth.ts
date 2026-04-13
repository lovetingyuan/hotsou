// ==================== Response Types ====================

import { Platform, ToastAndroid } from 'react-native'

import { BASE_URL } from './baseUrl'

const showToast = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT)
  }
}

export interface OtpResponse {
  success: boolean
  message?: string
  error?: string
  waitSeconds?: number
}

export interface VerifyResponse {
  success: boolean
  token?: string
  isNewUser?: boolean
  error?: string
}

export interface StatusResponse {
  success: boolean
  valid: boolean
  newToken?: string
}

export interface LogoutResponse {
  success: boolean
}

// ==================== API Functions ====================

/**
 * 发送验证码
 */
export async function sendOtp(email: string): Promise<OtpResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()

    if (response.status === 429) {
      // 频率限制
      const msg = data.error || '请求过于频繁'
      showToast(msg)
      return {
        success: false,
        error: msg,
        waitSeconds: data.waitSeconds,
      }
    }

    if (!response.ok) {
      const msg = data.error || '发送验证码失败'
      showToast(msg)
      return {
        success: false,
        error: msg,
      }
    }

    return {
      success: true,
      message: data.message,
    }
  } catch (error) {
    console.error('[Auth API] sendOtp error:', error)
    const msg = '网络错误，请稍后重试'
    showToast(msg)
    return {
      success: false,
      error: msg,
    }
  }
}

/**
 * 验证验证码
 */
export async function verifyOtp(email: string, otp: string): Promise<VerifyResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    })

    const data = await response.json()

    if (!response.ok) {
      const msg = data.error || '验证码错误'
      showToast(msg)
      return {
        success: false,
        error: msg,
      }
    }

    return {
      success: true,
      token: data.token,
      isNewUser: data.isNewUser,
    }
  } catch (error) {
    console.error('[Auth API] verifyOtp error:', error)
    const msg = '网络错误，请稍后重试'
    showToast(msg)
    return {
      success: false,
      error: msg,
    }
  }
}

/**
 * 检查登录状态（并自动刷新 token）
 */
export async function checkAuthStatus(email: string, token: string): Promise<StatusResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()

    return {
      success: data.success,
      valid: data.valid,
      newToken: data.newToken,
    }
  } catch (error) {
    console.error('[Auth API] checkAuthStatus error:', error)
    showToast('无法连接服务器检查状态')
    return {
      success: false,
      valid: false,
    }
  }
}

/**
 * 退出登录
 */
export async function logout(email: string, token: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()
    if (!response.ok) {
      showToast(data.error || '退出登录失败')
    }
    return data.success
  } catch (error) {
    console.error('[Auth API] logout error:', error)
    showToast('网络错误，退出登录失败')
    return false
  }
}
