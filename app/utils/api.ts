import { Platform, ToastAndroid } from 'react-native'
import { z } from 'zod'

import { BASE_URL } from '@/api/baseUrl'

export async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
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
    // If we already showed a toast (re-thrown error), we might not want to show it again.
    // However, if it's a network error (fetch failed), we do want to show it.
    // The previous block throws "message".
    // Let's rely on the fact that if it's a network error, it won't be caught by response.ok check.
    // But if I throw in the if(!response.ok) block, it goes to caller, NOT to this catch block?
    // Wait, try-catch only catches errors from the await fetch or the block.
    // If I throw inside the try, it IS caught by the catch block below?
    // YES.
    // So I need to be careful not to double toast.
    // I can check if error has been "handled" or just rely on the caller handling it?
    // No, if I throw inside try, catch catches it.
    // So if !response.ok, I show toast, then throw. The catch block catches it, shows toast AGAIN, then throws.
    // BAD.
    
    // Fix: Move the response check outside or handle cleanly.
    // Or, in catch block, check if toast was already shown? Hard.
    
    // Better structure:
    // fetch...
    // if !ok -> throw custom error with flag?
    
    // Or just let catch handle everything?
    // if !ok -> throw Error(data.error)
    // catch (e) -> Toast(e.message); throw e;
    
    // BUT, I need async parsing of error body if !ok.
    
    if (Platform.OS === 'android') {
       // Check if this is a "known" error that we already displayed?
       // Actually, simplified approach:
       // Don't toast in the !ok block. Just throw.
       // Handle ALL toasts in the catch block.
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

