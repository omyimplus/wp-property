import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import { RENTAL_REQUEST_SELECT, parseRentalRequestBody } from '../../../utils/rental-requests'

export default defineEventHandler(async (event) => {
  const { userId } = await requireStaff(event)
  const body = await readBody(event)
  const payload = parseRentalRequestBody(body as Record<string, unknown>)

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('rental_requests')
    .insert({
      ...payload,
      created_source: 'admin',
      created_by: userId,
    })
    .select(RENTAL_REQUEST_SELECT)
    .single()

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  return { rental: data }
})
