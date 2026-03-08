const { withProjectBuildGradle } = require('@expo/config-plugins')

module.exports = function withJitpackWorkaround(config) {
  return withProjectBuildGradle(config, (config) => {
    const gradleContent = config.modResults.contents

    const workaround = `
// Bypass Jitpack for Bouncy Castle
allprojects {
    repositories.all { repo ->
        if (repo instanceof MavenArtifactRepository && repo.url.toString().contains("jitpack.io")) {
            repo.content {
                excludeGroup("org.bouncycastle")
            }
        }
    }
}
`

    if (!gradleContent.includes('excludeGroup("org.bouncycastle")')) {
      config.modResults.contents += workaround
    }

    return config
  })
}
