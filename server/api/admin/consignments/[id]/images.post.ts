import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../../utils/require-staff'
import { assertAdminWebpStoragePath } from '../../../../utils/admin-image-storage'
import { attachImageUrls } from '../../../../utils/properties'
import { storagePathPrefix } from '../../../../utils/property-customers'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const prefix = storagePathPrefix(id)
  const body = await readBody(event)
  const storage_path = typeof body?.storage_path === 'string' ? body.storage_path.trim() : ''
  assertAdminWebpStoragePath(
    storage_path,
    prefix,
    'path รูปไม่ถูกต้อง (ต้องอยู่ใต้ pc/{id}/ และเป็น .webp)',
  )

  const client = await serverSupabaseClient(event)
  const { data: pc } = await client
    .from('property_customers')
    .select('property_id')
    .eq('id', id)
    .maybeSingle()

  if (!pc) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบรายการฝากขาย' })
  }
  if (pc.property_id) {
    throw createError({ statusCode: 400, statusMessage: 'รายการอนุมัติแล้ว — อัปโหลดรูปที่หน้าทรัพย์' })
  }

  const { count } = await client
    .from('property_customer_images')
    .select('id', { count: 'exact', head: true })
    .eq('property_customer_id', id)

  const sort_order = typeof body?.sort_order === 'number' ? body.sort_order : (count ?? 0)

  const { data, error } = await client
    .from('property_customer_images')
    .insert({
      property_customer_id: id,
      storage_path,
      sort_order,
    })
    .select('id, property_customer_id, storage_path, sort_order, created_at')
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const config = useRuntimeConfig()
  const [image] = attachImageUrls([data], config.public.supabase.url)
  return { image }
})
