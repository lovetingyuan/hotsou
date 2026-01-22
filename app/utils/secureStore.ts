import * as SecureStore from 'expo-secure-store'

const AUTH_KEYS = {
  EMAIL: 'auth_email',
  TOKEN: 'auth_token',
} as const

/**
 * 获取存储的邮箱
 */
export async function getAuthEmail(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(AUTH_KEYS.EMAIL)
  } catch (error) {
    console.error('[SecureStore] Failed to get email:', error)
    return null
  }
}

/**
 * 获取存储的 token
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(AUTH_KEYS.TOKEN)
  } catch (error) {
    console.error('[SecureStore] Failed to get token:', error)
    return null
  }
}

/**
 * 获取完整的认证数据
 */
export async function getAuthData(): Promise<{ email: string | null; token: string | null }> {
  const [email, token] = await Promise.all([getAuthEmail(), getAuthToken()])
  return { email, token }
}

/**
 * 保存认证数据（邮箱和 token）
 */
export async function setAuthData(email: string, token: string): Promise<void> {
  try {
    await Promise.all([
      SecureStore.setItemAsync(AUTH_KEYS.EMAIL, email),
      SecureStore.setItemAsync(AUTH_KEYS.TOKEN, token),
    ])
  } catch (error) {
    console.error('[SecureStore] Failed to save auth data:', error)
    throw error
  }
}

/**
 * 清除所有认证数据（退出登录）
 */
export async function clearAuthData(): Promise<void> {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(AUTH_KEYS.EMAIL),
      SecureStore.deleteItemAsync(AUTH_KEYS.TOKEN),
    ])
  } catch (error) {
    console.error('[SecureStore] Failed to clear auth data:', error)
    throw error
  }
}

/**
 * 只清除 token，保留邮箱（验证码校验失败时使用）
 */
export async function clearToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(AUTH_KEYS.TOKEN)
  } catch (error) {
    console.error('[SecureStore] Failed to clear token:', error)
    throw error
  }
}

/**
 * 更新 token（刷新 token 时使用）
 */
export async function updateToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(AUTH_KEYS.TOKEN, token)
  } catch (error) {
    console.error('[SecureStore] Failed to update token:', error)
    throw error
  }
}
