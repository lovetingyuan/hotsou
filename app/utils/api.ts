import { Platform, ToastAndroid } from 'react-native'
import { z } from 'zod'

import { BASE_URL } from '@/api/baseUrl'
import { markAuthExpired } from '@/utils/authSession'

const AUTH_EXPIRED_MESSAGE = '登录已失效，请重新验证邮箱'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const showToast = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT)
  }
}

export async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`
  console.log('[api] request start', {
    method: options?.method ?? 'GET',
    url,
  })

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    console.log('[api] response received', {
      method: options?.method ?? 'GET',
      url,
      status: response.status,
      ok: response.ok,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const message =
        response.status === 401
          ? AUTH_EXPIRED_MESSAGE
          : errorData.error || `请求失败: ${response.status}`

      if (response.status === 401) {
        await markAuthExpired()
      }

      showToast(message)
      throw new ApiError(message, response.status)
    }

    return response.json() as Promise<T>
  } catch (error) {
    if (error instanceof ApiError) {
      console.log('[api] request failed', {
        method: options?.method ?? 'GET',
        url,
        status: error.status,
        message: error.message,
      })
      throw error
    }

    const errorMessage = error instanceof Error ? error.message : undefined
    const message = errorMessage || '网络请求失败'

    console.log('[api] request failed', {
      method: options?.method ?? 'GET',
      url,
      message,
    })

    showToast(message)
    throw error
  }
}

export const userApi = {
  sync: async (
    email: string,
    token: string,
    payload: {
      set?: Record<string, any>
      delete?: string[]
      get?: string[]
    },
  ) => {
    const Schema = z.object({
      success: z.boolean(),
      result: z.record(z.string(), z.any()),
      error: z.string().optional(),
    })

    const data = await request('/api/users/sync', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, ...payload }),
    })

    return Schema.parse(data)
  },
}
