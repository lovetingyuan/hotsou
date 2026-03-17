import * as cheerio from 'cheerio'
import { z } from 'zod'

const CACHE_TTL_MS = 30 * 60 * 1000
const RELEASES_URL = 'https://github.com/lovetingyuan/hotsou/releases/'

export const GitHubReleaseInfoSchema = z.object({
  version: z.string(),
  date: z.string().optional(),
  changelog: z.string(),
  downloadUrl: z.string().url(),
})

export type GitHubReleaseInfo = z.infer<typeof GitHubReleaseInfoSchema>

let cachedReleaseInfo: GitHubReleaseInfo | null = null
let cacheTime = 0

const buildDownloadUrl = (version: string) =>
  `https://ghfast.top/https://github.com/lovetingyuan/hotsou/releases/download/${version}/hotsou-${version.replace('v', '')}.apk`

const parseReleaseInfo = (html: string): GitHubReleaseInfo => {
  const $ = cheerio.load(html)
  const $item = $('.Box-body').first()

  const version = $item.find('a').first().text().trim()
  const date = $item.closest('section').find('relative-time').first().attr('datetime')
  const changelog = $item.find('.markdown-body').text().trim()

  if (!version) {
    throw new Error('Failed to parse latest release version from GitHub')
  }

  return GitHubReleaseInfoSchema.parse({
    version,
    date,
    changelog,
    downloadUrl: buildDownloadUrl(version),
  })
}

export const getLatestGitHubRelease = async (): Promise<GitHubReleaseInfo> => {
  const now = Date.now()

  if (cachedReleaseInfo && now - cacheTime < CACHE_TTL_MS) {
    return cachedReleaseInfo
  }

  try {
    const html = await fetch(RELEASES_URL).then((response) => response.text())
    const releaseInfo = parseReleaseInfo(html)

    cachedReleaseInfo = releaseInfo
    cacheTime = now

    return releaseInfo
  } catch (error) {
    if (cachedReleaseInfo) {
      return cachedReleaseInfo
    }

    throw error
  }
}
