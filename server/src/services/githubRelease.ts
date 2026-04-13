import * as cheerio from 'cheerio'
import { z } from 'zod'

const CACHE_TTL_MS = 30 * 60 * 1000
const RELEASES_URL = 'https://github.com/lovetingyuan/hotsou/releases/'
const RELEASES_API_URL = 'https://api.github.com/repos/lovetingyuan/hotsou/releases/latest'
const CACHE_KEY_URL = 'https://cache.internal/github-release'

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

export const parseReleaseInfo = (html: string): GitHubReleaseInfo => {
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

const fetchFromApi = async (): Promise<GitHubReleaseInfo> => {
  const response = await fetch(RELEASES_API_URL, {
    headers: { 'User-Agent': 'hotsou-server' },
  })
  if (!response.ok) {
    throw new Error(`GitHub API returned ${response.status}`)
  }
  const json = await response.json<{ tag_name: string; published_at: string; body: string }>()
  return GitHubReleaseInfoSchema.parse({
    version: json.tag_name,
    date: json.published_at,
    changelog: json.body ?? '',
    downloadUrl: buildDownloadUrl(json.tag_name),
  })
}

export const getLatestGitHubRelease = async (): Promise<GitHubReleaseInfo> => {
  const now = Date.now()

  // 内存二级缓存（同一 isolate 内有效）
  if (cachedReleaseInfo && now - cacheTime < CACHE_TTL_MS) {
    return cachedReleaseInfo
  }

  // Cloudflare Cache API
  const cache = caches.default
  const cacheRequest = new Request(CACHE_KEY_URL)
  const cachedResponse = await cache.match(cacheRequest)
  if (cachedResponse) {
    const data = await cachedResponse.json<GitHubReleaseInfo>()
    cachedReleaseInfo = data
    cacheTime = now
    return data
  }

  let releaseInfo: GitHubReleaseInfo

  try {
    // 优先使用 GitHub Releases API
    releaseInfo = await fetchFromApi()
  } catch {
    // API 失败，fallback 到 HTML 解析
    const html = await fetch(RELEASES_URL).then((r) => r.text())
    releaseInfo = parseReleaseInfo(html)
  }

  // 写入 Cloudflare Cache（30分钟）
  const responseToCache = new Response(JSON.stringify(releaseInfo), {
    headers: { 'Cache-Control': 'max-age=1800', 'Content-Type': 'application/json' },
  })
  await cache.put(cacheRequest, responseToCache)

  cachedReleaseInfo = releaseInfo
  cacheTime = now

  return releaseInfo
}
