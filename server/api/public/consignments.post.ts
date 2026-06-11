import { serverSupabaseServiceRole } from '#supabase/server'
import {
  assertPropertyCustomerCreateRequired,
  parsePropertyCustomerBody,
  PROPERTY_CUSTOMER_SELECT,
} from '../../utils/property-customers'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const payload = parsePropertyCustomerBody({
    ...(body as Record<string, unknown>),
    status: 'pending_approval',
  })
  assertPropertyCustomerCreateRequired(payload)

  const service = serverSupabaseServiceRole(event)
  const { data, error } = await service
    .from('property_customers')
    .insert({ ...payload, created_by: null })
    .select(PROPERTY_CUSTOMER_SELECT)
    .single()

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  return { consignment: data }
})
