import { Platform, Share, ToastAndroid } from 'react-native'
import { z } from 'zod'

import { request } from './api'

const SHORT_LINK_MIN_LENGTH = 80
const SHORT_LINK_TIMEOUT_MS = 8000

const ShortLinkResponseSchema = z.object({
  success: z.boolean(),
  result: z.object({
    shortUrl: z.string().url(),
  }),
})

async function getShareUrl(url: string) {
  console.log('[share] enter getShareUrl', { url, urlLength: url.length })

  if (url.length < SHORT_LINK_MIN_LENGTH) {
    console.log('[share] skip shortening because url is short')
    return url
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, SHORT_LINK_TIMEOUT_MS)

  try {
    console.log('[share] before request /api/links/shorten')
    const data = await request('/api/links/shorten', {
      method: 'POST',
      body: JSON.stringify({ url }),
      signal: controller.signal,
    })
    console.log('[share] after request /api/links/shorten', data)

    return ShortLinkResponseSchema.parse(data).result.shortUrl
  } catch (error) {
    console.log('[share] shorten failed', error)
    console.warn('Failed to create short link, fallback to original URL.', error)
    return url
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function sharePage(title: string, url: string) {
  console.log('[share] enter sharePage', { title, urlLength: url.length })
  const shareUrl = await getShareUrl(url)

  if (Platform.OS === 'android' && shareUrl !== url) {
    ToastAndroid.show('已转换为短链接', ToastAndroid.SHORT)
  }

  await Share.share({
    title,
    message: `${title}\n${shareUrl}`,
    url: shareUrl,
  })
}
