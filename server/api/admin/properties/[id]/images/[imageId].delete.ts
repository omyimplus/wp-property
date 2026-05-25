import { serverSupabaseServiceRole } from '#supabase/server'
import { requireStaff } from '../../../../../utils/require-staff'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const propertyId = getRouterParam(event, 'id')
  const imageId = getRouterParam(event, 'imageId')
  if (!propertyId || !imageId) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรูปภาพ' })
  }

  const service = serverSupabaseServiceRole(event)

  const { data: image, error: fetchError } = await service
    .from('property_images')
    .select('storage_path')
    .eq('id', imageId)
    .eq('property_id', propertyId)
    .single()

  if (fetchError || !image) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบรูปภาพ' })
  }

  await service.storage.from('property-images').remove([image.storage_path])

  const { error } = await service
    .from('property_images')
    .delete()
    .eq('id', imageId)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { ok: true }
})
