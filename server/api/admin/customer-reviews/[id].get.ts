import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import {
  CUSTOMER_REVIEW_SELECT,
  attachCustomerReviewUrls,
} from '../../../utils/customer-reviews'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const config = useRuntimeConfig()
  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('customer_reviews')
    .select(CUSTOMER_REVIEW_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบรีวิว' })
  }

  return { item: attachCustomerReviewUrls(data, config.public.supabase.url) }
})
