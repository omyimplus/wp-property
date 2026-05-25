import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import { RENTAL_REQUEST_SELECT, parseRentalRequestBody } from '../../../utils/rental-requests'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const client = await serverSupabaseClient(event)
  const { data: existing } = await client
    .from('rental_requests')
    .select('status')
    .eq('id', id)
    .maybeSingle()

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบคำขอเช่าทรัพย์' })
  }
  if (existing.status === 'rejected') {
    throw createError({
      statusCode: 400,
      statusMessage: 'รายการไม่อนุมัติแล้ว — แก้ไขไม่ได้',
    })
  }

  const body = await readBody(event)
  const payload = parseRentalRequestBody(body as Record<string, unknown>)

  const { data, error } = await client
    .from('rental_requests')
    .update(payload)
    .eq('id', id)
    .select(RENTAL_REQUEST_SELECT)
    .single()

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  return { rental: data }
})
