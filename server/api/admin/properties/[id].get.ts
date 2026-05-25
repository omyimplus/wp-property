import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import { attachImageUrls, PROPERTY_SELECT } from '../../../utils/properties'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบทรัพย์' })
  }

  const config = useRuntimeConfig()
  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('properties')
    .select(`${PROPERTY_SELECT}, property_images (id, property_id, storage_path, sort_order, created_at)`)
    .eq('id', id)
    .single()

  if (error) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบทรัพย์' })
  }

  const images = attachImageUrls(
    (data.property_images ?? []).sort(
      (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order,
    ),
    config.public.supabase.url,
  )

  const { property_images, ...property } = data
  return { property: { ...property, images } }
})
