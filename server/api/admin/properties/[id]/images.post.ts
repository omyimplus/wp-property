import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../../utils/require-staff'
import { attachImageUrls } from '../../../../utils/properties'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const propertyId = getRouterParam(event, 'id')
  if (!propertyId) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบทรัพย์' })
  }

  const body = await readBody(event)
  const storage_path = typeof body?.storage_path === 'string' ? body.storage_path.trim() : ''
  if (
    !storage_path
    || storage_path.includes('..')
    || !storage_path.startsWith(`${propertyId}/`)
    || !storage_path.endsWith('.webp')
  ) {
    throw createError({ statusCode: 400, statusMessage: 'path รูปไม่ถูกต้อง (ต้องเป็น .webp)' })
  }

  const client = await serverSupabaseClient(event)

  const { count } = await client
    .from('property_images')
    .select('id', { count: 'exact', head: true })
    .eq('property_id', propertyId)

  const sort_order = typeof body?.sort_order === 'number' ? body.sort_order : (count ?? 0)

  const { data, error } = await client
    .from('property_images')
    .insert({
      property_id: propertyId,
      storage_path,
      sort_order,
    })
    .select('id, property_id, storage_path, sort_order, created_at')
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const config = useRuntimeConfig()
  const [image] = attachImageUrls([data], config.public.supabase.url)
  return { image }
})
