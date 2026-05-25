import type { RentalRequestStatus } from '~/types/rental-request'
import { RENTAL_LIST_PAGE_SIZE } from '~/types/rental-request'

export interface RentalRequestQueryFilters {
  status: RentalRequestStatus
  min_rent?: number
  max_rent?: number
  province?: string
  district?: string
  subdistrict?: string
  page: number
  page_size: number
}

export function parseRentalListQuery(query: Record<string, unknown>): RentalRequestQueryFilters {
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
      ? (st as RentalRequestStatus)
      : 'pending_approval'

  const pageRaw = parseNum(query.page)
  const page = pageRaw != null && pageRaw >= 1 ? Math.trunc(pageRaw) : 1
  const pageSizeRaw = parseNum(query.page_size)
  const page_size =
    pageSizeRaw != null && pageSizeRaw >= 1 && pageSizeRaw <= 50
      ? Math.trunc(pageSizeRaw)
      : RENTAL_LIST_PAGE_SIZE

  return {
    status,
    min_rent: parseNum(query.min_rent),
    max_rent: parseNum(query.max_rent),
    province: str(query.province),
    district: str(query.district),
    subdistrict: str(query.subdistrict),
    page,
    page_size,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyRentalFilters(query: any, filters: RentalRequestQueryFilters) {
  let q = query.eq('status', filters.status)

  if (filters.province) q = q.eq('desired_province', filters.province)
  if (filters.district) q = q.eq('desired_district', filters.district)
  if (filters.subdistrict) q = q.eq('desired_subdistrict', filters.subdistrict)

  if (filters.min_rent != null) q = q.gte('rent_budget_max', filters.min_rent)
  if (filters.max_rent != null) q = q.lte('rent_budget_min', filters.max_rent)

  return q
}
