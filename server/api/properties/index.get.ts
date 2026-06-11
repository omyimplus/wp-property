import { getQuery } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { applyPropertyFilters, parsePropertyListQuery } from '../../utils/property-filters'
import { attachImageUrls, PROPERTY_SELECT } from '../../utils/properties'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const client = await serverSupabaseClient(event)
  const raw = getQuery(event) as Record<string, unknown>
  const filters = parsePropertyListQuery({ ...raw, status: 'published' })

  const keyword = typeof raw.keyword === 'string' ? raw.keyword.trim() : ''
  const from = (filters.page - 1) * filters.page_size
  const to = from + filters.page_size - 1

  let query = client
    .from('properties')
    .select(`${PROPERTY_SELECT}, property_images (id, storage_path, sort_order)`, {
      count: 'exact',
    })
    .order('updated_at', { ascending: false })

  query = applyPropertyFilters(query, filters)

  if (keyword) {
    const pattern = `%${keyword}%`
    query = query.or(
      `listing_title.ilike.${pattern},project_name.ilike.${pattern},province.ilike.${pattern},district.ilike.${pattern},subdistrict.ilike.${pattern},property_code.ilike.${pattern}`,
    )
  }

  const { data: properties, error, count } = await query.range(from, to)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const total = count ?? 0
  const total_pages = Math.max(1, Math.ceil(total / filters.page_size))

  const list = (properties ?? []).map((p) => {
    const imgs = (p.property_images ?? []).sort(
      (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order,
    )
    const { property_images, ...rest } = p
    const withUrls = attachImageUrls(imgs, config.public.supabase.url)
    return {
      ...rest,
      image_count: imgs.length,
      cover_url: withUrls[0]?.public_url ?? null,
      image_urls: withUrls.map(i => i.public_url),
    }
  })

  return {
    properties: list,
    total,
    page: filters.page,
    page_size: filters.page_size,
    total_pages,
  }
})
