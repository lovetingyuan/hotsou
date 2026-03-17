import { OpenAPIRoute } from 'chanfana'
import { z } from 'zod'
import { getLatestGitHubRelease, GitHubReleaseInfoSchema } from '../services/githubRelease'
import { type AppContext } from '../types'

export class AppVersion extends OpenAPIRoute {
  schema = {
    tags: ['App'],
    summary: 'Get App Version',
    responses: {
      '200': {
        description: 'Returns the latest app version info',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              result: z.object({
                version: GitHubReleaseInfoSchema,
              }),
            }),
          },
        },
      },
    },
  }

  async handle(_c: AppContext) {
    const releaseInfo = await getLatestGitHubRelease()

    return {
      success: true,
      result: {
        version: releaseInfo,
      },
    }
  }
}
