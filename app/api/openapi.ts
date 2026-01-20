const BASE_URL = __DEV__ 
  ? process.env.API_BASE_URL_DEV || 'http://127.0.0.1:8787'
  : process.env.API_BASE_URL_PROD || 'http://hotsou.tingyuan.in'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface UserApplicationData {
  $tabsList: Array<{
    name: string
    title: string
    url: string
    show: boolean
    builtIn?: boolean
    icon?: string
  }>
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
    headers?: HeadersInit
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new ApiError(
          errorData.error || 'Request failed',
          response.status,
          errorData
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError('Network error', 0)
    }
  }

  async getUserApplicationData(
    userId: string
  ): Promise<ApiResponse<UserApplicationData>> {
    return this.request<ApiResponse<UserApplicationData>>(
      'GET',
      `/api/users/${encodeURIComponent(userId)}/application-data`
    )
  }

  async createUserApplicationData(
    userId: string,
    data: UserApplicationData
  ): Promise<ApiResponse<UserApplicationData>> {
    return this.request<ApiResponse<UserApplicationData>>(
      'POST',
      `/api/users/${encodeURIComponent(userId)}/application-data`,
      data
    )
  }
}

export const openapi = new OpenApiClient()
