import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import {
  assertPropertyCustomerCreateRequired,
  parsePropertyCustomerBody,
  PROPERTY_CUSTOMER_SELECT,
} from '../../../utils/property-customers'

export default defineEventHandler(async (event) => {
  const { userId } = await requireStaff(event)
  const body = await readBody(event)
  const payload = parsePropertyCustomerBody(body as Record<string, unknown>)
  assertPropertyCustomerCreateRequired(payload)

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('property_customers')
    .insert({ ...payload, created_by: userId })
    .select(PROPERTY_CUSTOMER_SELECT)
    .single()

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  return { consignment: data }
})
