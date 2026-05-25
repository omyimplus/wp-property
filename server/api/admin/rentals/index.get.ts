import { getQuery } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import { applyRentalFilters, parseRentalListQuery } from '../../../utils/rental-request-filters'
import { enrichRentalsWithProfiles } from '../../../utils/rental-request-profiles'
import { RENTAL_REQUEST_SELECT } from '../../../utils/rental-requests'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const client = await serverSupabaseClient(event)
  const filters = parseRentalListQuery(getQuery(event) as Record<string, unknown>)

  const from = (filters.page - 1) * filters.page_size
  const to = from + filters.page_size - 1

  let query = client
    .from('rental_requests')
    .select(RENTAL_REQUEST_SELECT, { count: 'exact' })
    .order('updated_at', { ascending: false })

  query = applyRentalFilters(query, filters)

  const { data, error, count } = await query.range(from, to)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const total = count ?? 0
  const total_pages = Math.max(1, Math.ceil(total / filters.page_size))
  const rentals = await enrichRentalsWithProfiles(client, data ?? [])

  return {
    rentals,
    filters,
    total,
    page: filters.page,
    page_size: filters.page_size,
    total_pages,
  }
})
