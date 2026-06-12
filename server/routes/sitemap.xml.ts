import { serverSupabaseClient } from '#supabase/server'
import {
  buildSitemapUrlEntry,
  PUBLIC_SITEMAP_PATHS,
} from '../utils/public-sitemap'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl.replace(/\/$/, '')
  const client = await serverSupabaseClient(event)

  const [{ data: properties }, { data: articles }] = await Promise.all([
    client
      .from('properties')
      .select('property_code, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false }),
    client
      .from('articles')
      .select('slug, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false }),
  ])

  const urls: string[] = []

  for (const path of PUBLIC_SITEMAP_PATHS) {
    urls.push(
      buildSitemapUrlEntry({
        siteUrl,
        path,
        priority: path === '/' ? '1.0' : '0.8',
        changefreq: path === '/' ? 'daily' : 'weekly',
      }),
    )
  }

  for (const property of properties ?? []) {
    if (!property.property_code) continue
    urls.push(
      buildSitemapUrlEntry({
        siteUrl,
        path: `/properties/${property.property_code}`,
        lastmod: property.updated_at,
        changefreq: 'daily',
        priority: '0.9',
      }),
    )
  }

  for (const article of articles ?? []) {
    if (!article.slug) continue
    urls.push(
      buildSitemapUrlEntry({
        siteUrl,
        path: `/articles/${article.slug}`,
        lastmod: article.updated_at,
        changefreq: 'weekly',
        priority: '0.7',
      }),
    )
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=3600, s-maxage=3600')
  return body
})
