import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import { SALE_REQUEST_SELECT, parseSaleRequestBody } from '../../../utils/sale-requests'

export default defineEventHandler(async (event) => {
  const { userId } = await requireStaff(event)
  const body = await readBody(event)
  const payload = parseSaleRequestBody(body as Record<string, unknown>)

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('sale_requests')
    .insert({
      ...payload,
      created_source: 'admin',
      created_by: userId,
    })
    .select(SALE_REQUEST_SELECT)
    .single()

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  return { sale: data }
})
