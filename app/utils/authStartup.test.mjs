import assert from 'node:assert/strict'
import { test } from 'node:test'

import { resolveStartupAuthAction } from './authStartup.ts'

const email = 'user@example.com'
const token = 'saved-token'

test('valid status keeps the session logged in', async () => {
  const action = await resolveStartupAuthAction({
    email,
    token,
    checkAuthStatus: async (checkedEmail, checkedToken) => {
      assert.equal(checkedEmail, email)
      assert.equal(checkedToken, token)
      return { success: true, valid: true, newToken: token }
    },
  })
  assert.deepEqual(action, { type: 'login', newToken: token })
})

test('only a successful check reporting invalid credentials requests reauthentication', async () => {
  assert.deepEqual(
    await resolveStartupAuthAction({
      email,
      token,
      checkAuthStatus: async () => ({ success: true, valid: false }),
    }),
    { type: 'reauth', email },
  )
})

test('failed checks and network errors do not request reauthentication', async () => {
  for (const valid of [true, false]) {
    assert.deepEqual(
      await resolveStartupAuthAction({
        email,
        token,
        checkAuthStatus: async () => ({ success: false, valid }),
      }),
      { type: 'unavailable' },
    )
  }
  assert.deepEqual(
    await resolveStartupAuthAction({
      email,
      token,
      checkAuthStatus: async () => {
        throw new Error('Network unavailable')
      },
    }),
    { type: 'unavailable' },
  )
})

test('missing credentials are handled without making a status request', async () => {
  const checkAuthStatus = async () => assert.fail('status must not be requested')
  assert.deepEqual(await resolveStartupAuthAction({ email: null, token: null, checkAuthStatus }), {
    type: 'logged-out',
  })
  assert.deepEqual(await resolveStartupAuthAction({ email, token: null, checkAuthStatus }), {
    type: 'reauth',
    email,
  })
})
