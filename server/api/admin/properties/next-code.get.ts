import { serverSupabaseServiceRole } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import { generateNextPropertyCode } from '../../../utils/property-code'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const client = serverSupabaseServiceRole(event)
  const property_code = await generateNextPropertyCode(client)
  return { property_code }
})
