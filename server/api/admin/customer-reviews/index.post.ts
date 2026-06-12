import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import {
  CUSTOMER_REVIEW_SELECT,
  attachCustomerReviewUrls,
  parseCustomerReviewBody,
} from '../../../utils/customer-reviews'

export default defineEventHandler(async (event) => {
  const { userId } = await requireStaff(event)
  const body = await readBody(event)
  const payload = parseCustomerReviewBody(body as Record<string, unknown>)

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('customer_reviews')
    .insert({ ...payload, created_by: userId })
    .select(CUSTOMER_REVIEW_SELECT)
    .single()

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  const config = useRuntimeConfig()
  return { item: attachCustomerReviewUrls(data, config.public.supabase.url) }
})
