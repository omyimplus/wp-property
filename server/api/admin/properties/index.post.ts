import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import { generateNextPropertyCode } from '../../../utils/property-code'
import { assertPropertyCreateRequired, parsePropertyBody, PROPERTY_SELECT } from '../../../utils/properties'

export default defineEventHandler(async (event) => {
  const { userId } = await requireStaff(event)
  const body = await readBody(event)
  const payload = parsePropertyBody(body as Record<string, unknown>, {
    includePropertyCode: false,
  })
  assertPropertyCreateRequired(payload)

  const service = serverSupabaseServiceRole(event)
  payload.property_code = await generateNextPropertyCode(service)

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('properties')
    .insert({ ...payload, property_source: 'system', created_by: userId })
    .select(PROPERTY_SELECT)
    .single()

  if (error) {
    const msg = error.message.includes('duplicate')
      ? 'รหัสทรัพย์ซ้ำ กรุณาลองใหม่'
      : error.message
    throw createError({ statusCode: 400, statusMessage: msg })
  }

  return { property: data }
})
