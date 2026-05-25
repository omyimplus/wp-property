import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../../utils/require-staff'
import {
  RENTAL_REQUEST_SELECT,
  parseRentalRequestStatus,
} from '../../../../utils/rental-requests'

export default defineEventHandler(async (event) => {
  const { userId } = await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const body = await readBody(event)
  const status = parseRentalRequestStatus(body as Record<string, unknown>)

  const client = await serverSupabaseClient(event)
  const now = new Date().toISOString()
  const patch: Record<string, unknown> = {
    status,
    handled_by: userId,
    handled_at: now,
  }
  if (status === 'pending_approval') {
    patch.handled_by = null
    patch.handled_at = null
  }

  const { data, error } = await client
    .from('rental_requests')
    .update(patch)
    .eq('id', id)
    .select(RENTAL_REQUEST_SELECT)
    .single()

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  return { rental: data }
})
