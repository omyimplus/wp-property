import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '~~/server/utils/require-staff'
import {
  PROPERTY_INQUIRY_SELECT,
  parsePropertyInquiryStatus,
} from '~~/server/utils/property-inquiries'

export default defineEventHandler(async (event) => {
  const { userId } = await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const body = await readBody(event)
  const status = parsePropertyInquiryStatus(body as Record<string, unknown>)

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
    .from('property_inquiries')
    .update(patch)
    .eq('id', id)
    .select(PROPERTY_INQUIRY_SELECT)
    .single()

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  return { inquiry: data }
})
