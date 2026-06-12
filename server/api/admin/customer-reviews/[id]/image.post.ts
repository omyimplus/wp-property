import { serverSupabaseServiceRole } from '#supabase/server'
import { requireStaff } from '../../../../utils/require-staff'
import {
  CUSTOMER_REVIEW_SELECT,
  attachCustomerReviewUrls,
  validateCustomerReviewImagePath,
} from '../../../../utils/customer-reviews'
import { ADMIN_IMAGE_BUCKET } from '../../../../utils/admin-image-storage'

const BUCKET = ADMIN_IMAGE_BUCKET

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const body = await readBody(event)
  const storage_path = typeof body?.storage_path === 'string' ? body.storage_path.trim() : ''
  if (!validateCustomerReviewImagePath(id, storage_path)) {
    throw createError({ statusCode: 400, statusMessage: 'path รูปไม่ถูกต้อง (ต้องเป็น .webp)' })
  }

  const service = serverSupabaseServiceRole(event)
  const { data: existing } = await service
    .from('customer_reviews')
    .select('image_storage_path')
    .eq('id', id)
    .maybeSingle()

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบรีวิว' })
  }

  if (existing.image_storage_path && existing.image_storage_path !== storage_path) {
    await service.storage.from(BUCKET).remove([existing.image_storage_path])
  }

  const { data, error } = await service
    .from('customer_reviews')
    .update({ image_storage_path: storage_path })
    .eq('id', id)
    .select(CUSTOMER_REVIEW_SELECT)
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const config = useRuntimeConfig()
  return { item: attachCustomerReviewUrls(data, config.public.supabase.url) }
})
