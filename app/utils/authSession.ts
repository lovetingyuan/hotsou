import { getStoreMethods } from '@/store'
import { clearToken, getAuthEmail } from '@/utils/secureStore'

import { createAuthSession } from './authSessionCore'

const authSession = createAuthSession({
  clearToken,
  getAuthEmail,
  setIsLogin: (nextIsLogin) => {
    getStoreMethods().setIsLogin(nextIsLogin)
  },
})

export const markAuthExpired = authSession.markAuthExpired
export const subscribeAuthExpired = authSession.subscribeAuthExpired
