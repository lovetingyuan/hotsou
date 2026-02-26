import { request } from './api'
import { z } from 'zod'

const AppVersionResponseSchema = z.object({
  success: z.boolean(),
  result: z.object({
    version: z.object({
      version: z.string(),
      date: z.string().optional(),
      changelog: z.string(),
    }),
  }),
})

export default async function checkAppUpdate() {
  const data = await request('/api/app/version')
  const { result } = AppVersionResponseSchema.parse(data)
  const latest = result?.version
  if (latest) {
    const version = latest.version.slice(1)
    return {
      version,
      changelog: latest.changelog,
      downloadUrl: `https://ghfast.top/https://github.com/lovetingyuan/hotsou/releases/download/v${version}/hotsou-${version}.apk`,
    }
  }
}
