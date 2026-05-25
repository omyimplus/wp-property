import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import { LOAN_APPLICATION_SELECT, parseLoanApplicationBody } from '../../../utils/loan-applications'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const client = await serverSupabaseClient(event)
  const { data: existing } = await client
    .from('loan_applications')
    .select('status')
    .eq('id', id)
    .maybeSingle()

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบคำขอสินเชื่อ' })
  }
  if (existing.status === 'rejected') {
    throw createError({
      statusCode: 400,
      statusMessage: 'รายการไม่อนุมัติแล้ว — แก้ไขไม่ได้',
    })
  }

  const body = await readBody(event)
  const payload = parseLoanApplicationBody(body as Record<string, unknown>)

  const { data, error } = await client
    .from('loan_applications')
    .update(payload)
    .eq('id', id)
    .select(LOAN_APPLICATION_SELECT)
    .single()

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  return { loan: data }
})
