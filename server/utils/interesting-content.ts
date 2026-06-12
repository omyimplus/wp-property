import type { InterestingContentStatus } from '~/types/interesting-content'
import { validateAdminWebpStoragePath } from './admin-image-storage'

export const INTERESTING_CONTENT_SELECT = `
  id, title, excerpt, body_html, cover_storage_path, hero_storage_path, link_url,
  sort_order, status, created_by, created_at, updated_at
`

const BUCKET = 'property-images'

function publicStorageUrl(supabaseUrl: string, storagePath: string) {
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${storagePath}`
}

export function attachInterestingContentUrls<
  T extends { cover_storage_path: string | null, hero_storage_path: string | null },
>(item: T, supabaseUrl: string): T & { cover_url: string | null, hero_url: string | null } {
  return {
    ...item,
    cover_url: item.cover_storage_path
      ? publicStorageUrl(supabaseUrl, item.cover_storage_path)
      : null,
    hero_url: item.hero_storage_path
      ? publicStorageUrl(supabaseUrl, item.hero_storage_path)
      : null,
  }
}

export function attachInterestingContentUrlsList<
  T extends { cover_storage_path: string | null, hero_storage_path: string | null },
>(items: T[], supabaseUrl: string) {
  return items.map(item => attachInterestingContentUrls(item, supabaseUrl))
}

/** @deprecated ใช้ attachInterestingContentUrls */
export function attachCoverUrl<T extends { cover_storage_path: string | null, hero_storage_path?: string | null }>(
  item: T,
  supabaseUrl: string,
): T & { cover_url: string | null, hero_url?: string | null } {
  const withUrls = attachInterestingContentUrls(
    {
      ...item,
      hero_storage_path: item.hero_storage_path ?? null,
    },
    supabaseUrl,
  )
  return withUrls
}

/** @deprecated ใช้ attachInterestingContentUrlsList */
export function attachCoverUrls<T extends { cover_storage_path: string | null, hero_storage_path?: string | null }>(
  items: T[],
  supabaseUrl: string,
) {
  return attachInterestingContentUrlsList(
    items.map(item => ({ ...item, hero_storage_path: item.hero_storage_path ?? null })),
    supabaseUrl,
  )
}

function isLegacyCoverPath(itemId: string, storagePath: string): boolean {
  const prefix = `ic/${itemId}/`
  if (!storagePath.startsWith(prefix)) return false
  if (storagePath.includes('/body/') || storagePath.includes('/hero/') || storagePath.includes('/cover/')) {
    return false
  }
  return storagePath.endsWith('.webp')
}

export function validateCoverPath(itemId: string, storagePath: string): boolean {
  if (validateAdminWebpStoragePath(storagePath, `ic/${itemId}/cover/`)) return true
  return isLegacyCoverPath(itemId, storagePath)
}

export function validateHeroPath(itemId: string, storagePath: string): boolean {
  return validateAdminWebpStoragePath(storagePath, `ic/${itemId}/hero/`)
}

export function assertHasRequiredImages(row: {
  cover_storage_path: string | null
  hero_storage_path: string | null
}) {
  if (!row.cover_storage_path) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาอัปโหลดรูปปก' })
  }
  if (!row.hero_storage_path) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาอัปโหลดรูปหลักแนวนอน' })
  }
}

export function parseInterestingContentBody(body: Record<string, unknown>) {
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  if (!title) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุหัวข้อ' })
  }

  const excerptRaw = typeof body.excerpt === 'string' ? body.excerpt.trim() : ''
  const body_html = typeof body.body_html === 'string' ? body.body_html : ''
  const linkRaw = typeof body.link_url === 'string' ? body.link_url.trim() : ''

  const st = body.status as string
  const status: InterestingContentStatus =
    st === 'published' || st === 'draft' ? st : 'draft'

  const sortRaw = Number(body.sort_order)
  const sort_order =
    Number.isFinite(sortRaw) && sortRaw >= 0 ? Math.trunc(sortRaw) : 0

  return {
    title,
    excerpt: excerptRaw || null,
    body_html,
    link_url: linkRaw || null,
    sort_order,
    status,
  }
}
