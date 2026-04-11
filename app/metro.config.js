const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '..')
const workspaceNodeModulesPath = path.join(workspaceRoot, 'node_modules')

const config = getDefaultConfig(projectRoot)
// Keep hoisted workspace packages and their bundled assets visible to Metro.
config.watchFolders = Array.from(new Set([...(config.watchFolders ?? []), workspaceNodeModulesPath]))
config.resolver.nodeModulesPaths = Array.from(
  new Set([
    ...(config.resolver?.nodeModulesPaths ?? []),
    path.join(projectRoot, 'node_modules'),
    workspaceNodeModulesPath,
  ]),
)

module.exports = config
