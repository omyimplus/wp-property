import { getQuery } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import { applyLoanFilters, parseLoanListQuery } from '../../../utils/loan-application-filters'
import { enrichLoansWithProfiles } from '../../../utils/loan-application-profiles'
import { LOAN_APPLICATION_SELECT } from '../../../utils/loan-applications'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const client = await serverSupabaseClient(event)
  const filters = parseLoanListQuery(getQuery(event) as Record<string, unknown>)

  const from = (filters.page - 1) * filters.page_size
  const to = from + filters.page_size - 1

  let query = client
    .from('loan_applications')
    .select(LOAN_APPLICATION_SELECT, { count: 'exact' })
    .order('updated_at', { ascending: false })

  query = applyLoanFilters(query, filters)

  const { data, error, count } = await query.range(from, to)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const total = count ?? 0
  const total_pages = Math.max(1, Math.ceil(total / filters.page_size))

  const loans = await enrichLoansWithProfiles(client, data ?? [])

  return {
    loans,
    filters,
    total,
    page: filters.page,
    page_size: filters.page_size,
    total_pages,
  }
})
