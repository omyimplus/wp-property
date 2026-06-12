import { serverSupabaseClient } from '#supabase/server'
import {
  CUSTOMER_REVIEW_SELECT,
  attachCustomerReviewUrlsList,
} from '../../utils/customer-reviews'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('customer_reviews')
    .select(CUSTOMER_REVIEW_SELECT)
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('updated_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return {
    items: attachCustomerReviewUrlsList(data ?? [], config.public.supabase.url),
  }
})
