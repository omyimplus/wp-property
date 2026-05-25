import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import {
  assertCustomerContactRequired,
  assertListingCreateRequired,
} from '../../../utils/property-payload'
import {
  parsePropertyCustomerBody,
  PROPERTY_CUSTOMER_SELECT,
} from '../../../utils/property-customers'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const client = await serverSupabaseClient(event)
  const { data: existing } = await client
    .from('property_customers')
    .select('property_id, status')
    .eq('id', id)
    .maybeSingle()

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบรายการฝากขาย' })
  }
  if (existing.property_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'รายการอนุมัติแล้ว — แก้ไขได้ที่หน้าอสังหาริมทรัพย์',
    })
  }

  const body = await readBody(event)
  const payload = parsePropertyCustomerBody(body as Record<string, unknown>)
  assertCustomerContactRequired(payload)
  assertListingCreateRequired(payload)

  const { data, error } = await client
    .from('property_customers')
    .update(payload)
    .eq('id', id)
    .select(PROPERTY_CUSTOMER_SELECT)
    .single()

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  return { consignment: data }
})
