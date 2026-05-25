import type { ListingTab, PropertySource, PropertyStatus, PropertyType } from '~/types/property'
import { PROPERTY_LIST_PAGE_SIZE } from '~/types/property'

export interface PropertyQueryFilters {
  listing: ListingTab
  status: PropertyStatus
  property_source?: PropertySource
  property_type?: PropertyType
  min_price?: number
  max_price?: number
  province?: string
  district?: string
  subdistrict?: string
  page: number
  page_size: number
}

export function parsePropertyListQuery(query: Record<string, unknown>): PropertyQueryFilters {
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
  const validStatuses = ['draft', 'pending_approval', 'published', 'rejected']
  const status =
    typeof st === 'string' && validStatuses.includes(st) ? (st as PropertyStatus) : 'pending_approval'

  const ps = query.property_source as string
  const property_source =
    ps === 'system' || ps === 'customer_web' ? (ps as PropertySource) : undefined

  const pageRaw = parseNum(query.page)
  const page = pageRaw != null && pageRaw >= 1 ? Math.trunc(pageRaw) : 1
  const pageSizeRaw = parseNum(query.page_size)
  const page_size =
    pageSizeRaw != null && pageSizeRaw >= 1 && pageSizeRaw <= 50
      ? Math.trunc(pageSizeRaw)
      : PROPERTY_LIST_PAGE_SIZE

  return {
    listing: validListing,
    status,
    property_source,
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
export function applyPropertyFilters(query: any, filters: PropertyQueryFilters) {
  let q = query

  if (filters.listing === 'sale') {
    q = q.eq('for_sale', true)
  } else if (filters.listing === 'rent') {
    q = q.eq('for_rent', true)
  }

  q = q.eq('status', filters.status)

  if (filters.property_source) {
    q = q.eq('property_source', filters.property_source)
  }

  if (filters.property_type) {
    q = q.eq('property_type', filters.property_type)
  }
  if (filters.province) {
    q = q.eq('province', filters.province)
  }
  if (filters.district) {
    q = q.eq('district', filters.district)
  }
  if (filters.subdistrict) {
    q = q.eq('subdistrict', filters.subdistrict)
  }

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
