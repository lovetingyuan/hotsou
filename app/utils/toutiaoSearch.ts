const TOUTIAO_SEARCH_HOST = 'so.toutiao.com'

export function getToutiaoSearchRewriteUrl(rawUrl: string): string | null {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return null
  }

  if (url.hostname !== TOUTIAO_SEARCH_HOST || url.pathname !== '/search') {
    return null
  }

  const keyword = url.searchParams.get('keyword')?.trim()
  if (!keyword) {
    return null
  }

  const isDesktopSearch = url.searchParams.get('dvpf') === 'pc'
  if (isDesktopSearch && url.protocol === 'https:') {
    return null
  }

  if (isDesktopSearch) {
    url.protocol = 'https:'
    return url.toString()
  }

  const rewriteUrl = new URL('https://so.toutiao.com/search')
  rewriteUrl.searchParams.set('keyword', keyword)
  rewriteUrl.searchParams.set('pd', 'information')
  rewriteUrl.searchParams.set('dvpf', 'pc')
  return rewriteUrl.toString()
}
