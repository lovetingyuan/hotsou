import { z } from 'zod'

const TabItemSchema = z.object({
  name: z.string(),
  title: z.string(),
  url: z.string(),
  show: z.boolean(),
  builtIn: z.boolean().optional(),
  icon: z.string().optional(),
})

const UserDataSchema = z.object({
  $tabsList: z.array(TabItemSchema),
  $enableTextSelect: z.boolean(),
})

const API_BASE_URL = __DEV__ ? 'http://localhost:8787' : 'https://your-production-url.com'

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export const authApi = {
  checkRegistered: async (email: string) => {
    const Schema = z.object({
      success: z.boolean(),
      registered: z.boolean(),
    })

    const data = await request('/api/auth/check-registered', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })

    return Schema.parse(data)
  },

  requestOtp: async (email: string) => {
    const Schema = z.object({
      success: z.boolean(),
      message: z.string(),
    })

    const data = await request('/api/auth/otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })

    return Schema.parse(data)
  },

  verifyOtp: async (email: string, otp: string) => {
    const Schema = z.object({
      success: z.boolean(),
      token: z.string().optional(),
      error: z.string().optional(),
    })

    const data = await request('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    })

    return Schema.parse(data)
  },
}

export const userApi = {
  getData: async (email: string, token: string) => {
    const Schema = z.object({
      success: z.boolean(),
      result: UserDataSchema.nullable(),
      error: z.string().optional(),
    })

    const data = await request(`/api/users/${encodeURIComponent(email)}/application-data`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return Schema.parse(data)
  },

  createData: async (email: string, token: string, data: z.infer<typeof UserDataSchema>) => {
    const Schema = z.object({
      success: z.boolean(),
      result: UserDataSchema,
      error: z.string().optional(),
    })

    const responseData = await request(`/api/users/${encodeURIComponent(email)}/application-data`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    return Schema.parse(responseData)
  },

  updateData: async (email: string, token: string, data: z.infer<typeof UserDataSchema>) => {
    const Schema = z.object({
      success: z.boolean(),
      result: UserDataSchema,
      error: z.string().optional(),
    })

    const responseData = await request(`/api/users/${encodeURIComponent(email)}/application-data`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    return Schema.parse(responseData)
  },

  deleteData: async (email: string, token: string) => {
    const Schema = z.object({
      success: z.boolean(),
      error: z.string().optional(),
    })

    const data = await request(`/api/users/${encodeURIComponent(email)}/application-data`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return Schema.parse(data)
  },
}
