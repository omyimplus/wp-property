import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import { attachImageUrls } from '../../../utils/properties'
import { PROPERTY_CUSTOMER_SELECT } from '../../../utils/property-customers'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const config = useRuntimeConfig()
  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('property_customers')
    .select(
      `${PROPERTY_CUSTOMER_SELECT}, property_customer_images (id, property_customer_id, storage_path, sort_order, created_at), properties (property_code)`,
    )
    .eq('id', id)
    .single()

  if (error || !data) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบรายการฝากขาย' })
  }

  const imgs = (data.property_customer_images ?? []).sort(
    (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order,
  )
  const { property_customer_images, properties: propJoin, ...rest } = data

  return {
    consignment: {
      ...rest,
      property_code: propJoin?.property_code ?? null,
      images: attachImageUrls(imgs, config.public.supabase.url),
    },
  }
})
