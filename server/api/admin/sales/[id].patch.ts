import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import { SALE_REQUEST_SELECT, parseSaleRequestBody } from '../../../utils/sale-requests'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const client = await serverSupabaseClient(event)
  const { data: existing } = await client
    .from('sale_requests')
    .select('status')
    .eq('id', id)
    .maybeSingle()

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบคำขอสนใจซื้อ' })
  }
  if (existing.status === 'rejected') {
    throw createError({
      statusCode: 400,
      statusMessage: 'รายการไม่อนุมัติแล้ว — แก้ไขไม่ได้',
    })
  }

  const body = await readBody(event)
  const payload = parseSaleRequestBody(body as Record<string, unknown>)

  const { data, error } = await client
    .from('sale_requests')
    .update(payload)
    .eq('id', id)
    .select(SALE_REQUEST_SELECT)
    .single()

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  return { sale: data }
})
