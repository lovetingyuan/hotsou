export type AuthExpiredListener = (email: string | null) => void

export interface AuthSessionDependencies {
  clearToken: () => Promise<void>
  getAuthEmail: () => Promise<string | null>
  setIsLogin: (nextIsLogin: boolean) => void
}

export function createAuthSession({
  clearToken,
  getAuthEmail,
  setIsLogin,
}: AuthSessionDependencies) {
  const authExpiredListeners = new Set<AuthExpiredListener>()
  let isHandlingAuthExpired = false

  const subscribeAuthExpired = (listener: AuthExpiredListener) => {
    authExpiredListeners.add(listener)
    return () => {
      authExpiredListeners.delete(listener)
    }
  }

  const markAuthExpired = async (email?: string | null) => {
    const nextEmail = email ?? (await getAuthEmail())

    if (isHandlingAuthExpired) {
      return nextEmail
    }

    isHandlingAuthExpired = true
    try {
      await clearToken()
      setIsLogin(false)
      authExpiredListeners.forEach((listener) => listener(nextEmail))

      return nextEmail
    } finally {
      isHandlingAuthExpired = false
    }
  }

  return {
    markAuthExpired,
    subscribeAuthExpired,
  }
}
