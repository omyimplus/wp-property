import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import {
  CUSTOMER_REVIEW_SELECT,
  assertHasReviewImage,
  attachCustomerReviewUrls,
  parseCustomerReviewBody,
} from '../../../utils/customer-reviews'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const body = await readBody(event)
  const payload = parseCustomerReviewBody(body as Record<string, unknown>)

  const client = await serverSupabaseClient(event)
  const { data: existing, error: loadError } = await client
    .from('customer_reviews')
    .select('image_storage_path')
    .eq('id', id)
    .maybeSingle()

  if (loadError) {
    throw createError({ statusCode: 500, statusMessage: loadError.message })
  }
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบรีวิว' })
  }

  const { data, error } = await client
    .from('customer_reviews')
    .update(payload)
    .eq('id', id)
    .select(CUSTOMER_REVIEW_SELECT)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบรีวิว' })
  }

  assertHasReviewImage(data)

  const config = useRuntimeConfig()
  return { item: attachCustomerReviewUrls(data, config.public.supabase.url) }
})
