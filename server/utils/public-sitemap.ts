export const PUBLIC_SITEMAP_PATHS = [
  '/',
  '/about',
  '/services',
  '/services/properties',
  '/services/loans',
  '/consign',
  '/rent',
  '/contact',
  '/articles',
  '/reviews',
  '/interesting-content',
  '/privacy',
  '/terms',
  '/properties',
] as const

export function localizedSitemapPaths(path: string) {
  const normalized = path === '/' ? '' : path
  return {
    th: normalized || '/',
    en: `/en${normalized}`,
  }
}

export function absoluteSiteUrl(siteUrl: string, path: string) {
  const base = siteUrl.replace(/\/$/, '')
  if (!path || path === '/') return `${base}/`
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

export function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function formatSitemapDate(value?: string | null) {
  if (!value) return new Date().toISOString()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

export function buildSitemapUrlEntry(options: {
  siteUrl: string
  path: string
  lastmod?: string | null
  changefreq?: 'daily' | 'weekly' | 'monthly'
  priority?: string
}) {
  const { siteUrl, path, lastmod, changefreq = 'weekly', priority = '0.7' } = options
  const localized = localizedSitemapPaths(path)
  const thUrl = absoluteSiteUrl(siteUrl, localized.th)
  const enUrl = absoluteSiteUrl(siteUrl, localized.en)

  return `
  <url>
    <loc>${escapeXml(thUrl)}</loc>
    <xhtml:link rel="alternate" hreflang="th-TH" href="${escapeXml(thUrl)}" />
    <xhtml:link rel="alternate" hreflang="en-US" href="${escapeXml(enUrl)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(thUrl)}" />
    <lastmod>${formatSitemapDate(lastmod)}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}
