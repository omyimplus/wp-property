export function normalizeSiteUrl(siteUrl: string) {
  return siteUrl.replace(/\/$/, '')
}

export function absoluteSiteUrl(siteUrl: string, path: string) {
  const base = normalizeSiteUrl(siteUrl)
  if (!path || path === '/') return `${base}/`
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

export function resolveSiteMediaUrl(siteUrl: string, src?: string | null) {
  if (!src) return undefined
  if (src.startsWith('http://') || src.startsWith('https://')) return src
  return absoluteSiteUrl(siteUrl, src)
}
