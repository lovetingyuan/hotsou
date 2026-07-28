export interface StartupAuthStatus {
  success: boolean
  valid: boolean
  newToken?: string
}

export type StartupAuthAction =
  | {
      type: 'logged-out'
    }
  | {
      type: 'login'
      newToken?: string
    }
  | {
      type: 'reauth'
      email: string
    }
  | {
      type: 'unavailable'
    }

export interface ResolveStartupAuthActionInput {
  email: string | null
  token: string | null
  checkAuthStatus: (email: string, token: string) => Promise<StartupAuthStatus>
}

export async function resolveStartupAuthAction({
  email,
  token,
  checkAuthStatus,
}: ResolveStartupAuthActionInput): Promise<StartupAuthAction> {
  if (!email) {
    return { type: 'logged-out' }
  }

  if (!token) {
    return { type: 'reauth', email }
  }

  let status: StartupAuthStatus
  try {
    status = await checkAuthStatus(email, token)
  } catch {
    return { type: 'unavailable' }
  }

  if (!status.success && !status.valid) {
    return { type: 'unavailable' }
  }

  if (status.valid) {
    return {
      type: 'login',
      newToken: status.newToken,
    }
  }

  return { type: 'reauth', email }
}
