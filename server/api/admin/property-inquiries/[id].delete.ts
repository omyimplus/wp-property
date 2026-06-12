import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '~~/server/utils/require-staff'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const client = await serverSupabaseClient(event)
  const { data: existing, error: fetchError } = await client
    .from('property_inquiries')
    .select('id, status')
    .eq('id', id)
    .maybeSingle()

  if (fetchError) {
    throw createError({ statusCode: 500, statusMessage: fetchError.message })
  }
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบรายการ' })
  }
  if (existing.status !== 'rejected') {
    throw createError({ statusCode: 400, statusMessage: 'ลบได้เฉพาะรายการที่ปิดแล้ว' })
  }

  const { error } = await client.from('property_inquiries').delete().eq('id', id)
  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  return { ok: true }
})
