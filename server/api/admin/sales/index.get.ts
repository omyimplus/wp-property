import { getQuery } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import { applySaleFilters, parseSaleListQuery } from '../../../utils/sale-request-filters'
import { enrichSalesWithProfiles } from '../../../utils/sale-request-profiles'
import { SALE_REQUEST_SELECT } from '../../../utils/sale-requests'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const client = await serverSupabaseClient(event)
  const filters = parseSaleListQuery(getQuery(event) as Record<string, unknown>)

  const from = (filters.page - 1) * filters.page_size
  const to = from + filters.page_size - 1

  let query = client
    .from('sale_requests')
    .select(SALE_REQUEST_SELECT, { count: 'exact' })
    .order('updated_at', { ascending: false })

  query = applySaleFilters(query, filters)

  const { data, error, count } = await query.range(from, to)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const total = count ?? 0
  const total_pages = Math.max(1, Math.ceil(total / filters.page_size))
  const sales = await enrichSalesWithProfiles(client, data ?? [])

  return {
    sales,
    filters,
    total,
    page: filters.page,
    page_size: filters.page_size,
    total_pages,
  }
})
