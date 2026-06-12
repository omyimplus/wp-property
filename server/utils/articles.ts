import type { ArticleStatus } from '~/types/article'
import { validateAdminWebpStoragePath } from './admin-image-storage'

export const ARTICLE_SELECT = `
  id, slug, title, excerpt, body_html, cover_storage_path,
  sort_order, status, published_at, created_by, created_at, updated_at
`

const BUCKET = 'property-images'

function publicStorageUrl(supabaseUrl: string, storagePath: string) {
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${storagePath}`
}

export function attachArticleUrls<
  T extends { cover_storage_path: string | null },
>(item: T, supabaseUrl: string): T & { cover_url: string | null } {
  return {
    ...item,
    cover_url: item.cover_storage_path
      ? publicStorageUrl(supabaseUrl, item.cover_storage_path)
      : null,
  }
}

export function attachArticleUrlsList<
  T extends { cover_storage_path: string | null },
>(items: T[], supabaseUrl: string) {
  return items.map(item => attachArticleUrls(item, supabaseUrl))
}

export function articleCoverPrefix(articleId: string) {
  return `articles/${articleId}/cover/`
}

export function validateArticleCoverPath(articleId: string, storagePath: string): boolean {
  return validateAdminWebpStoragePath(storagePath, articleCoverPrefix(articleId))
}

export function slugifyTitle(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
  return slug || `article-${Date.now()}`
}

export function assertHasCoverImage(row: { cover_storage_path: string | null }) {
  if (!row.cover_storage_path) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาอัปโหลดรูปหลัก' })
  }
}

export function parseArticleBody(body: Record<string, unknown>) {
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  if (!title) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุหัวข้อ' })
  }

  const slugRaw = typeof body.slug === 'string' ? body.slug.trim() : ''
  const slug = slugRaw ? slugifyTitle(slugRaw) : slugifyTitle(title)

  const excerptRaw = typeof body.excerpt === 'string' ? body.excerpt.trim() : ''
  const body_html = typeof body.body_html === 'string' ? body.body_html : ''

  const st = body.status as string
  const status: ArticleStatus =
    st === 'published' || st === 'draft' ? st : 'draft'

  const sortRaw = Number(body.sort_order)
  const sort_order =
    Number.isFinite(sortRaw) && sortRaw >= 0 ? Math.trunc(sortRaw) : 0

  return {
    slug,
    title,
    excerpt: excerptRaw || null,
    body_html,
    sort_order,
    status,
  }
}

export function publishedAtForStatus(
  status: ArticleStatus,
  existingPublishedAt: string | null,
): string | null {
  if (status === 'published') {
    return existingPublishedAt ?? new Date().toISOString()
  }
  return null
}
