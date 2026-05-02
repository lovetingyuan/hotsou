import assert from 'node:assert/strict'

import { normalizeAuthEmail } from './authEmail.ts'

assert.equal(normalizeAuthEmail('  User.Name+Tag@Example.COM  '), 'user.name+tag@example.com')
assert.equal(normalizeAuthEmail('already-normal@example.com'), 'already-normal@example.com')

console.log('app auth email normalization test passed')
