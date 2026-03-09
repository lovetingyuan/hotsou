const { execSync } = require('child_process')

module.exports = function ({ types: t }) {
  return {
    name: 'replace-git-hash',
    visitor: {
      Identifier(path) {
        if (path.node.name === 'GIT_HASH') {
          const gitHash = getGitHash()
          path.replaceWith(t.valueToNode(gitHash))
        } else if (path.node.name === 'BUILD_DATE') {
          path.replaceWith(t.valueToNode(Date.now()))
        }
      },
    },
  }
}

function getGitHash() {
  try {
    return execSync('git rev-parse HEAD').toString().trim().slice(0, 8)
  } catch (error) {
    console.error('Error getting git hash:', error)
    return 'unknown'
  }
}
