import { getQuery } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import {
  applyPropertyCustomerFilters,
  parsePropertyCustomerListQuery,
} from '../../../utils/property-customer-filters'
import { attachImageUrls } from '../../../utils/properties'
import { PROPERTY_CUSTOMER_SELECT } from '../../../utils/property-customers'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const config = useRuntimeConfig()
  const client = await serverSupabaseClient(event)
  const filters = parsePropertyCustomerListQuery(getQuery(event) as Record<string, unknown>)

  const from = (filters.page - 1) * filters.page_size
  const to = from + filters.page_size - 1

  let query = client
    .from('property_customers')
    .select(
      `${PROPERTY_CUSTOMER_SELECT}, property_customer_images (id, storage_path, sort_order), properties (property_code)`,
      { count: 'exact' },
    )
    .order('updated_at', { ascending: false })

  query = applyPropertyCustomerFilters(query, filters)

  const { data: rows, error, count } = await query.range(from, to)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const total = count ?? 0
  const total_pages = Math.max(1, Math.ceil(total / filters.page_size))

  const list = (rows ?? []).map((row) => {
    const imgs = (row.property_customer_images ?? []).sort(
      (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order,
    )
    const { property_customer_images, properties: propJoin, ...rest } = row
    const withUrls = attachImageUrls(imgs, config.public.supabase.url)
    const property_code = propJoin?.property_code ?? null
    return {
      ...rest,
      property_code,
      image_count: imgs.length,
      cover_url: withUrls[0]?.public_url ?? null,
      image_urls: withUrls.map(i => i.public_url),
    }
  })

  return {
    consignments: list,
    filters,
    total,
    page: filters.page,
    page_size: filters.page_size,
    total_pages,
  }
})
