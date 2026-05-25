import { serverSupabaseServiceRole } from '#supabase/server'
import { requireStaff } from '../../../../../utils/require-staff'

const BUCKET = 'property-images'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  const imageId = getRouterParam(event, 'imageId')
  if (!id || !imageId) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการหรือรูป' })
  }

  const service = serverSupabaseServiceRole(event)

  const { data: img } = await service
    .from('property_customer_images')
    .select('storage_path, property_customer_id')
    .eq('id', imageId)
    .eq('property_customer_id', id)
    .maybeSingle()

  if (!img) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบรูป' })
  }

  await service.storage.from(BUCKET).remove([img.storage_path])
  const { error } = await service.from('property_customer_images').delete().eq('id', imageId)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { ok: true }
})
