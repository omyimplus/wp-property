import { serverSupabaseServiceRole } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบทรัพย์' })
  }

  const service = serverSupabaseServiceRole(event)

  const { data: images } = await service
    .from('property_images')
    .select('storage_path')
    .eq('property_id', id)

  if (images?.length) {
    await service.storage.from('property-images').remove(images.map(i => i.storage_path))
  }

  const { error } = await service.from('properties').delete().eq('id', id)
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { ok: true }
})
