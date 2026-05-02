import assert from 'node:assert/strict'

import { createAuthSession } from './authSessionCore.ts'

let tokenCleared = false
let loginState = null
let fallbackEmailRequested = false
const notifiedEmails = []

const authSession = createAuthSession({
  clearToken: async () => {
    tokenCleared = true
  },
  getAuthEmail: async () => {
    fallbackEmailRequested = true
    return 'saved@example.com'
  },
  setIsLogin: (nextIsLogin) => {
    loginState = nextIsLogin
  },
})

authSession.subscribeAuthExpired((email) => {
  notifiedEmails.push(email)
})

const handledEmail = await authSession.markAuthExpired()

assert.equal(handledEmail, 'saved@example.com')
assert.equal(fallbackEmailRequested, true)
assert.equal(tokenCleared, true)
assert.equal(loginState, false)
assert.deepEqual(notifiedEmails, ['saved@example.com'])

console.log('auth session expiration test passed')
