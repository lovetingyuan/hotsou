import assert from 'node:assert/strict'

import * as TabsModule from '../constants/Tabs'
import * as SyncDataModule from './syncData'

const normalizedFavorList = SyncDataModule.normalizeSyncValue('$favorList', {
  title: 'broken-favorite-list',
})

assert.ok(Array.isArray(normalizedFavorList))
assert.equal(normalizedFavorList.length, 0)
assert.equal(typeof normalizedFavorList.some, 'function')

const normalizedTabsList = SyncDataModule.normalizeSyncValue('$tabsList', {
  title: 'broken-tabs-list',
})

assert.equal(Array.isArray(normalizedTabsList), true)
assert.equal(normalizedTabsList.length, TabsModule.TabsList.length)

const normalizedPayload = SyncDataModule.normalizePartialSyncPayload({
  $favorList: [{ title: 'ok', url: 'https://example.com', created_at: 1 }, { title: 'broken' }],
  $fabPosition: 'middle',
  $enableTextSelect: 'yes',
})

assert.deepEqual(normalizedPayload.$favorList, [
  { title: 'ok', url: 'https://example.com', created_at: 1 },
])
assert.equal(normalizedPayload.$fabPosition, 'right')
assert.equal(normalizedPayload.$enableTextSelect, false)

assert.equal(
  SyncDataModule.hasSyncValueChanged({ title: 'broken-favorite-list' }, normalizedFavorList),
  true,
)

console.log('syncData normalization test passed')
