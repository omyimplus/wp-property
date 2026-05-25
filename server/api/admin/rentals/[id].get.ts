import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import { enrichRentalsWithProfiles } from '../../../utils/rental-request-profiles'
import { RENTAL_REQUEST_SELECT } from '../../../utils/rental-requests'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('rental_requests')
    .select(RENTAL_REQUEST_SELECT)
    .eq('id', id)
    .single()

  if (error || !data) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบคำขอเช่าทรัพย์' })
  }

  const [rental] = await enrichRentalsWithProfiles(client, [data])
  return { rental }
})
