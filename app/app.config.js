const { execFileSync } = require('node:child_process')

function getGitHash(projectRoot) {
  if (process.env.EAS_BUILD_GIT_COMMIT_HASH) {
    return process.env.EAS_BUILD_GIT_COMMIT_HASH.slice(0, 8)
  }

  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .trim()
      .slice(0, 8)
  } catch {
    // EAS 构建归档可能不包含 Git 仓库，缺失时仍允许构建。
    return 'unknown'
  }
}

/** @param {import('expo/config').ConfigContext} context */
module.exports = ({ config, projectRoot }) => ({
  ...config,
  extra: {
    ...config.extra,
    gitHash: getGitHash(projectRoot),
    buildDate: Date.now(),
  },
})
