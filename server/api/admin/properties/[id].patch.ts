import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import { parsePropertyBody, PROPERTY_SELECT } from '../../../utils/properties'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบทรัพย์' })
  }

  const body = await readBody(event)
  const payload = parsePropertyBody(body as Record<string, unknown>, {
    includePropertyCode: false,
    includePropertySource: true,
  })

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('properties')
    .update(payload)
    .eq('id', id)
    .select(PROPERTY_SELECT)
    .single()

  if (error) {
    const msg = error.message.includes('duplicate')
      ? 'รหัสทรัพย์นี้ถูกใช้แล้ว'
      : error.message
    throw createError({ statusCode: 400, statusMessage: msg })
  }

  return { property: data }
})
