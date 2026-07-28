import { factory } from '../factory'
import { getLatestGitHubRelease } from '../services/githubRelease'

export const AppVersion = factory.createHandlers(async (c) => {
  const releaseInfo = await getLatestGitHubRelease()

  return c.json({
    success: true,
    result: {
      version: releaseInfo,
    },
  })
})
