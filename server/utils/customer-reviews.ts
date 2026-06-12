import type { CustomerReviewStatus } from '~/types/customer-review'
import { validateAdminWebpStoragePath } from './admin-image-storage'

export const CUSTOMER_REVIEW_SELECT = `
  id, image_storage_path, sort_order, status, created_by, created_at, updated_at
`

const BUCKET = 'property-images'

function publicStorageUrl(supabaseUrl: string, storagePath: string) {
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${storagePath}`
}

export function attachCustomerReviewUrls<
  T extends { image_storage_path: string | null },
>(item: T, supabaseUrl: string): T & { image_url: string | null } {
  return {
    ...item,
    image_url: item.image_storage_path
      ? publicStorageUrl(supabaseUrl, item.image_storage_path)
      : null,
  }
}

export function attachCustomerReviewUrlsList<
  T extends { image_storage_path: string | null },
>(items: T[], supabaseUrl: string) {
  return items.map(item => attachCustomerReviewUrls(item, supabaseUrl))
}

export function customerReviewImagePrefix(reviewId: string) {
  return `customer-reviews/${reviewId}/image/`
}

export function validateCustomerReviewImagePath(reviewId: string, storagePath: string): boolean {
  return validateAdminWebpStoragePath(storagePath, customerReviewImagePrefix(reviewId))
}

export function assertHasReviewImage(row: { image_storage_path: string | null }) {
  if (!row.image_storage_path) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาอัปโหลดรูปรีวิว' })
  }
}

export function parseCustomerReviewBody(body: Record<string, unknown>) {
  const st = body.status as string
  const status: CustomerReviewStatus =
    st === 'published' || st === 'draft' ? st : 'draft'

  const sortRaw = Number(body.sort_order)
  const sort_order =
    Number.isFinite(sortRaw) && sortRaw >= 0 ? Math.trunc(sortRaw) : 0

  return { sort_order, status }
}

export function collectCustomerReviewStoragePaths(row: {
  image_storage_path: string | null
}): string[] {
  return row.image_storage_path ? [row.image_storage_path] : []
}
