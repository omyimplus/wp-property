import type { SupabaseClient } from '@supabase/supabase-js'
import { storagePathPrefix } from './property-customers'

const BUCKET = 'property-images'

/** ลบรูปใน Storage + แถว property_customer_images ก่อนลบรายการฝากขาย */
export async function purgeConsignmentFiles(
  service: SupabaseClient,
  propertyCustomerId: string,
) {
  const prefix = storagePathPrefix(propertyCustomerId)

  const { data: images } = await service
    .from('property_customer_images')
    .select('storage_path')
    .eq('property_customer_id', propertyCustomerId)

  const paths = new Set<string>((images ?? []).map(i => i.storage_path))

  const { data: listed, error: listError } = await service.storage
    .from(BUCKET)
    .list(prefix.replace(/\/$/, ''))

  if (listError) {
    throw createError({
      statusCode: 500,
      statusMessage: `ไม่สามารถอ่านรายการไฟล์รูป: ${listError.message}`,
    })
  }

  for (const entry of listed ?? []) {
    if (entry.name) {
      paths.add(`${prefix}${entry.name}`)
    }
  }

  if (paths.size > 0) {
    const { error: removeError } = await service.storage
      .from(BUCKET)
      .remove([...paths])

    if (removeError) {
      throw createError({
        statusCode: 500,
        statusMessage: `ลบไฟล์รูปไม่สำเร็จ: ${removeError.message}`,
      })
    }
  }

  const { error: imgDeleteError } = await service
    .from('property_customer_images')
    .delete()
    .eq('property_customer_id', propertyCustomerId)

  if (imgDeleteError) {
    throw createError({ statusCode: 500, statusMessage: imgDeleteError.message })
  }
}
