import type { LoanApplicationStatus } from '~/types/loan-application'
import { LOAN_LIST_PAGE_SIZE } from '~/types/loan-application'

export interface LoanApplicationQueryFilters {
  status: LoanApplicationStatus
  min_debt?: number
  max_debt?: number
  province?: string
  district?: string
  subdistrict?: string
  page: number
  page_size: number
}

export function parseLoanListQuery(query: Record<string, unknown>): LoanApplicationQueryFilters {
  const parseNum = (v: unknown) => {
    if (v === null || v === undefined || v === '') return undefined
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }

  const str = (v: unknown) => {
    if (typeof v !== 'string') return undefined
    const s = v.trim()
    return s.length ? s : undefined
  }

  const st = query.status as string
  const validStatuses = ['pending_approval', 'rejected', 'completed']
  const status =
    typeof st === 'string' && validStatuses.includes(st)
      ? (st as LoanApplicationStatus)
      : 'pending_approval'

  const pageRaw = parseNum(query.page)
  const page = pageRaw != null && pageRaw >= 1 ? Math.trunc(pageRaw) : 1
  const pageSizeRaw = parseNum(query.page_size)
  const page_size =
    pageSizeRaw != null && pageSizeRaw >= 1 && pageSizeRaw <= 50
      ? Math.trunc(pageSizeRaw)
      : LOAN_LIST_PAGE_SIZE

  return {
    status,
    min_debt: parseNum(query.min_debt),
    max_debt: parseNum(query.max_debt),
    province: str(query.province),
    district: str(query.district),
    subdistrict: str(query.subdistrict),
    page,
    page_size,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyLoanFilters(query: any, filters: LoanApplicationQueryFilters) {
  let q = query.eq('status', filters.status)

  if (filters.province) q = q.eq('residence_province', filters.province)
  if (filters.district) q = q.eq('residence_district', filters.district)
  if (filters.subdistrict) q = q.eq('residence_subdistrict', filters.subdistrict)

  if (filters.min_debt != null) q = q.gte('debt_amount', filters.min_debt)
  if (filters.max_debt != null) q = q.lte('debt_amount', filters.max_debt)

  return q
}
