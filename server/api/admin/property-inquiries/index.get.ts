import { getQuery } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '~~/server/utils/require-staff'
import {
  applyPropertyInquiryFilters,
  parsePropertyInquiryListQuery,
} from '~~/server/utils/property-inquiry-filters'
import { enrichPropertyInquiriesWithProfiles } from '~~/server/utils/property-inquiry-profiles'
import { PROPERTY_INQUIRY_SELECT } from '~~/server/utils/property-inquiries'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const client = await serverSupabaseClient(event)
  const filters = parsePropertyInquiryListQuery(getQuery(event) as Record<string, unknown>)

  const from = (filters.page - 1) * filters.page_size
  const to = from + filters.page_size - 1

  let query = client
    .from('property_inquiries')
    .select(PROPERTY_INQUIRY_SELECT, { count: 'exact' })
    .order('created_at', { ascending: false })

  query = applyPropertyInquiryFilters(query, filters)

  const { data, error, count } = await query.range(from, to)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const total = count ?? 0
  const total_pages = Math.max(1, Math.ceil(total / filters.page_size))
  const inquiries = await enrichPropertyInquiriesWithProfiles(client, data ?? [])

  return {
    inquiries,
    filters,
    total,
    page: filters.page,
    page_size: filters.page_size,
    total_pages,
  }
})
