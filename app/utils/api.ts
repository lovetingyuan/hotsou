import { Platform, ToastAndroid } from 'react-native'
import { z } from 'zod'

import { BASE_URL } from '@/api/baseUrl'

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
      const message = errorData.error || `请求失败: ${response.status}`
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT)
      }
      throw new Error(message)
    }

    return response.json() as Promise<T>
  } catch (error: any) {
    const message = error.message || '网络请求失败'

    console.log('[api] request failed', {
      method: options?.method ?? 'GET',
      url,
      message,
    })

    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT)
    }
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

    const data = await request(`/api/users/${encodeURIComponent(email)}/sync`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    return Schema.parse(data)
  },
}
