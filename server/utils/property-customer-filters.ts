import type { ListingTab, PropertyType } from '~/types/property'
import type { PropertyCustomerStatus } from '~/types/property-customer'
import { PROPERTY_CUSTOMER_LIST_PAGE_SIZE } from '~/types/property-customer'

export interface PropertyCustomerQueryFilters {
  listing: ListingTab
  status: PropertyCustomerStatus
  property_type?: PropertyType
  min_price?: number
  max_price?: number
  province?: string
  district?: string
  subdistrict?: string
  page: number
  page_size: number
}

export function parsePropertyCustomerListQuery(
  query: Record<string, unknown>,
): PropertyCustomerQueryFilters {
  const listing = query.listing
  const validListing: ListingTab =
    listing === 'sale' || listing === 'rent' ? listing : 'all'

  const pt = query.property_type as string
  const validTypes = ['house', 'condo', 'apartment', 'commercial', 'townhouse']
  const property_type =
    typeof pt === 'string' && validTypes.includes(pt) ? (pt as PropertyType) : undefined

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
  const validStatuses = ['pending_approval', 'rejected', 'approved']
  const status =
    typeof st === 'string' && validStatuses.includes(st)
      ? (st as PropertyCustomerStatus)
      : 'pending_approval'

  const pageRaw = parseNum(query.page)
  const page = pageRaw != null && pageRaw >= 1 ? Math.trunc(pageRaw) : 1
  const pageSizeRaw = parseNum(query.page_size)
  const page_size =
    pageSizeRaw != null && pageSizeRaw >= 1 && pageSizeRaw <= 50
      ? Math.trunc(pageSizeRaw)
      : PROPERTY_CUSTOMER_LIST_PAGE_SIZE

  return {
    listing: validListing,
    status,
    property_type,
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
export function applyPropertyCustomerFilters(query: any, filters: PropertyCustomerQueryFilters) {
  let q = query

  if (filters.listing === 'sale') {
    q = q.eq('for_sale', true)
  } else if (filters.listing === 'rent') {
    q = q.eq('for_rent', true)
  }

  q = q.eq('status', filters.status)

  if (filters.property_type) {
    q = q.eq('property_type', filters.property_type)
  }
  if (filters.province) q = q.eq('province', filters.province)
  if (filters.district) q = q.eq('district', filters.district)
  if (filters.subdistrict) q = q.eq('subdistrict', filters.subdistrict)

  const { min_price: min, max_price: max } = filters

  if (filters.listing === 'sale') {
    if (min != null) q = q.gte('sale_price', min)
    if (max != null) q = q.lte('sale_price', max)
  } else if (filters.listing === 'rent') {
    if (min != null) q = q.gte('rent_price', min)
    if (max != null) q = q.lte('rent_price', max)
  } else if (min != null || max != null) {
    const sale: string[] = ['for_sale.eq.true']
    const rent: string[] = ['for_rent.eq.true']
    if (min != null) {
      sale.push(`sale_price.gte.${min}`)
      rent.push(`rent_price.gte.${min}`)
    }
    if (max != null) {
      sale.push(`sale_price.lte.${max}`)
      rent.push(`rent_price.lte.${max}`)
    }
    q = q.or(`and(${sale.join(',')}),and(${rent.join(',')})`)
  }

  return q
}
