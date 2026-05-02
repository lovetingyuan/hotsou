import assert from 'node:assert/strict'

import { applyFixedWindowRateLimit, generateNumericOtp, parseBearerToken } from './authSecurity'

const uuid = '123e4567-e89b-12d3-a456-426614174000'

const otp = generateNumericOtp()
assert.match(otp, /^\d{6}$/)

for (let i = 0; i < 50; i += 1) {
  assert.match(generateNumericOtp(), /^\d{6}$/)
}

assert.equal(parseBearerToken(`Bearer ${uuid}`), uuid)
assert.equal(parseBearerToken(`bearer ${uuid}`), uuid)
assert.equal(parseBearerToken(uuid), null)
assert.equal(parseBearerToken(`Bearer ${uuid} extra`), null)
assert.equal(parseBearerToken('Bearer not-a-uuid'), null)
assert.equal(parseBearerToken(undefined), null)

const first = applyFixedWindowRateLimit({
  count: 0,
  limit: 2,
  now: 1_000,
  windowMs: 60_000,
  windowStartedAt: undefined,
})
assert.deepEqual(first, {
  allowed: true,
  count: 1,
  waitSeconds: 0,
  windowStartedAt: 1_000,
})

const blocked = applyFixedWindowRateLimit({
  count: 2,
  limit: 2,
  now: 31_000,
  windowMs: 60_000,
  windowStartedAt: 1_000,
})
assert.deepEqual(blocked, {
  allowed: false,
  count: 2,
  waitSeconds: 30,
  windowStartedAt: 1_000,
})

const reset = applyFixedWindowRateLimit({
  count: 2,
  limit: 2,
  now: 62_000,
  windowMs: 60_000,
  windowStartedAt: 1_000,
})
assert.deepEqual(reset, {
  allowed: true,
  count: 1,
  waitSeconds: 0,
  windowStartedAt: 62_000,
})

console.log('auth security helpers test passed')
