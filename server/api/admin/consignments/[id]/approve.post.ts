import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import { requireStaff } from '../../../../utils/require-staff'
import { approvePropertyCustomer } from '../../../../utils/property-customer-approve'
import { attachImageUrls } from '../../../../utils/properties'

export default defineEventHandler(async (event) => {
  const { userId } = await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const client = await serverSupabaseClient(event)
  const service = serverSupabaseServiceRole(event)
  const { property, property_customer } = await approvePropertyCustomer(
    client,
    service,
    id,
    userId,
  )

  const config = useRuntimeConfig()
  const { data: images } = await client
    .from('property_images')
    .select('id, property_id, storage_path, sort_order, created_at')
    .eq('property_id', property.id)
    .order('sort_order')

  return {
    property: {
      ...property,
      images: attachImageUrls(images ?? [], config.public.supabase.url),
    },
    consignment: property_customer,
    property_code: property.property_code,
  }
})
