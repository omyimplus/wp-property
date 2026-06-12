import type { ReelStatus } from '~/types/reel'
import { validateAdminWebpStoragePath } from './admin-image-storage'

export const REEL_SELECT = `
  id, poster_storage_path, video_storage_path, link_url,
  sort_order, status, created_by, created_at, updated_at
`

const BUCKET = 'property-images'

function publicStorageUrl(supabaseUrl: string, storagePath: string) {
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${storagePath}`
}

export function attachReelUrls<
  T extends { poster_storage_path: string | null, video_storage_path: string | null },
>(item: T, supabaseUrl: string): T & { poster_url: string | null, video_url: string | null } {
  return {
    ...item,
    poster_url: item.poster_storage_path
      ? publicStorageUrl(supabaseUrl, item.poster_storage_path)
      : null,
    video_url: item.video_storage_path
      ? publicStorageUrl(supabaseUrl, item.video_storage_path)
      : null,
  }
}

export function attachReelUrlsList<
  T extends { poster_storage_path: string | null, video_storage_path: string | null },
>(items: T[], supabaseUrl: string) {
  return items.map(item => attachReelUrls(item, supabaseUrl))
}

export function reelPosterPrefix(reelId: string) {
  return `reels/${reelId}/poster/`
}

export function reelVideoPrefix(reelId: string) {
  return `reels/${reelId}/video/`
}

export function validateReelPosterPath(reelId: string, storagePath: string): boolean {
  return validateAdminWebpStoragePath(storagePath, reelPosterPrefix(reelId))
}

export function validateReelVideoPath(reelId: string, storagePath: string): boolean {
  if (!storagePath || storagePath.includes('..')) return false
  const prefix = reelVideoPrefix(reelId)
  if (!storagePath.startsWith(prefix)) return false
  return /\.(mp4|webm)$/i.test(storagePath)
}

export function assertHasRequiredReelMedia(row: {
  poster_storage_path: string | null
  video_storage_path: string | null
}) {
  if (!row.poster_storage_path) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาอัปโหลดวิดีโอ (poster ไม่พบ)' })
  }
  if (!row.video_storage_path) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาอัปโหลดวิดีโอ' })
  }
}

export function parseReelBody(body: Record<string, unknown>) {
  const linkRaw = typeof body.link_url === 'string' ? body.link_url.trim() : ''

  const st = body.status as string
  const status: ReelStatus =
    st === 'published' || st === 'draft' ? st : 'draft'

  const sortRaw = Number(body.sort_order)
  const sort_order =
    Number.isFinite(sortRaw) && sortRaw >= 0 ? Math.trunc(sortRaw) : 0

  return {
    link_url: linkRaw || null,
    sort_order,
    status,
  }
}

export function collectReelStoragePaths(row: {
  poster_storage_path: string | null
  video_storage_path: string | null
}): string[] {
  return [row.poster_storage_path, row.video_storage_path].filter(Boolean) as string[]
}

export const REEL_VIDEO_MAX_BYTES = 50 * 1024 * 1024

const ALLOWED_REEL_VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/quicktime'] as const

export function isAllowedReelVideoUpload(mime: string, filename: string): boolean {
  if (ALLOWED_REEL_VIDEO_MIMES.includes(mime as (typeof ALLOWED_REEL_VIDEO_MIMES)[number])) {
    return true
  }
  const name = filename.toLowerCase()
  return name.endsWith('.mp4') || name.endsWith('.webm')
}

export function assertReelVideoWithinLimit(size: number, filename: string) {
  if (!isAllowedReelVideoUpload('', filename) && !filename.match(/\.(mp4|webm)$/i)) {
    throw createError({ statusCode: 400, statusMessage: 'วิดีโอไม่รองรับ (ใช้ MP4 หรือ WebM เท่านั้น)' })
  }
  if (size > REEL_VIDEO_MAX_BYTES) {
    throw createError({ statusCode: 400, statusMessage: 'วิดีโอใหญ่เกินไป (สูงสุด 50MB)' })
  }
}

export function reelVideoContentType(mime: string, filename: string): string {
  if (mime === 'video/webm') return 'video/webm'
  if (mime === 'video/mp4' || mime === 'video/quicktime') return 'video/mp4'
  const name = filename.toLowerCase()
  if (name.endsWith('.webm')) return 'video/webm'
  return 'video/mp4'
}

export function reelVideoExtension(contentType: string) {
  return contentType === 'video/webm' ? 'webm' : 'mp4'
}
