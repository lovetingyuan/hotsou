import assert from 'node:assert/strict'
import path from 'node:path'
import test from 'node:test'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const appRoot = path.resolve(import.meta.dirname, '..')
const metroConfigPath = path.join(appRoot, 'metro.config.js')
const workspaceNodeModulesPath = path.resolve(appRoot, '..', 'node_modules')

test('metro config exposes workspace node_modules for monorepo assets', () => {
  const config = require(metroConfigPath)

  assert.ok(
    config.watchFolders.includes(workspaceNodeModulesPath),
    `Expected watchFolders to include ${workspaceNodeModulesPath}`,
  )
  assert.ok(
    config.resolver?.nodeModulesPaths?.includes(workspaceNodeModulesPath),
    `Expected resolver.nodeModulesPaths to include ${workspaceNodeModulesPath}`,
  )
})
