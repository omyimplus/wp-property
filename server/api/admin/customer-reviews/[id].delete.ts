import { serverSupabaseServiceRole } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import { collectCustomerReviewStoragePaths } from '../../../utils/customer-reviews'
import { removeStoragePaths } from '../../../utils/rich-text-media'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const service = serverSupabaseServiceRole(event)
  const { data: row } = await service
    .from('customer_reviews')
    .select('image_storage_path')
    .eq('id', id)
    .maybeSingle()

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบรีวิว' })
  }

  const storagePaths = collectCustomerReviewStoragePaths(row)
  if (storagePaths.length) {
    await removeStoragePaths(service, storagePaths)
  }

  const { error } = await service.from('customer_reviews').delete().eq('id', id)
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { ok: true }
})
