import type { SaleRequestStatus } from '~/types/sale-request'
import { SALE_LIST_PAGE_SIZE } from '~/types/sale-request'

export interface SaleRequestQueryFilters {
  status: SaleRequestStatus
  min_price?: number
  max_price?: number
  province?: string
  district?: string
  subdistrict?: string
  page: number
  page_size: number
}

export function parseSaleListQuery(query: Record<string, unknown>): SaleRequestQueryFilters {
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
      ? (st as SaleRequestStatus)
      : 'pending_approval'

  const pageRaw = parseNum(query.page)
  const page = pageRaw != null && pageRaw >= 1 ? Math.trunc(pageRaw) : 1
  const pageSizeRaw = parseNum(query.page_size)
  const page_size =
    pageSizeRaw != null && pageSizeRaw >= 1 && pageSizeRaw <= 50
      ? Math.trunc(pageSizeRaw)
      : SALE_LIST_PAGE_SIZE

  return {
    status,
    min_price: parseNum(query.min_price),
    max_price: parseNum(query.max_price),
    province: str(query.province),
    district: str(query.district),
    subdistrict: str(query.subdistrict),
    page,
    page_size,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applySaleFilters(query: any, filters: SaleRequestQueryFilters) {
  let q = query.eq('status', filters.status)

  if (filters.province) q = q.eq('desired_province', filters.province)
  if (filters.district) q = q.eq('desired_district', filters.district)
  if (filters.subdistrict) q = q.eq('desired_subdistrict', filters.subdistrict)

  if (filters.min_price != null) q = q.gte('purchase_budget_max', filters.min_price)
  if (filters.max_price != null) q = q.lte('purchase_budget_min', filters.max_price)

  return q
}
