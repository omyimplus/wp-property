import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import { enrichSalesWithProfiles } from '../../../utils/sale-request-profiles'
import { SALE_REQUEST_SELECT } from '../../../utils/sale-requests'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('sale_requests')
    .select(SALE_REQUEST_SELECT)
    .eq('id', id)
    .single()

  if (error || !data) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบคำขอสนใจซื้อ' })
  }

  const [sale] = await enrichSalesWithProfiles(client, [data])
  return { sale }
})
