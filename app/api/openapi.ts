const BASE_URL = __DEV__ ? 'http://192.168.1.2:8787' : 'http://hotsou.tingyuan.in'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface UserApplicationData {
  $tabsList: {
    name: string
    title: string
    url: string
    show: boolean
    builtIn?: boolean
    icon?: string
  }[]
  $enableTextSelect: boolean
}

export interface ApiResponse<T> {
  success: boolean
  result?: T
  error?: string
}

export class OpenApiClient {
  private baseUrl: string

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    method: string,
    path: string,
    body?: any,
    headers?: HeadersInit,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`
    console.log(3423, url, body)
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      })
      console.log(9999, response)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new ApiError(errorData.error || 'Request failed', response.status, errorData)
      }

      return await response.json()
    } catch (error) {
      console.log(9999, 333, error)

      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError('Network error', 0)
    }
  }

  async getUserApplicationData(userId: string): Promise<ApiResponse<UserApplicationData>> {
    return this.request<ApiResponse<UserApplicationData>>(
      'GET',
      `/api/users/${encodeURIComponent(userId)}/application-data`,
    )
  }

  async createUserApplicationData(
    userId: string,
    data: UserApplicationData,
  ): Promise<ApiResponse<UserApplicationData>> {
    return this.request<ApiResponse<UserApplicationData>>(
      'POST',
      `/api/users/${encodeURIComponent(userId)}/application-data`,
      data,
    )
  }
}

export const openapi = new OpenApiClient()
