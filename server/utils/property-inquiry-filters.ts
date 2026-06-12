import type { PropertyInquiryListingType, PropertyInquiryStatus } from '~/types/property-inquiry'
import { PROPERTY_INQUIRY_LIST_PAGE_SIZE } from '~/types/property-inquiry'

export interface PropertyInquiryQueryFilters {
  listing: PropertyInquiryListingType
  status: PropertyInquiryStatus
  page: number
  page_size: number
}

export function parsePropertyInquiryListQuery(query: Record<string, unknown>): PropertyInquiryQueryFilters {
  const parseNum = (v: unknown) => {
    if (v === null || v === undefined || v === '') return undefined
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }

  const listingRaw = query.listing as string
  const listing: PropertyInquiryListingType =
    listingRaw === 'rent' ? 'rent' : 'sale'

  const st = query.status as string
  const validStatuses = ['pending_approval', 'rejected', 'completed']
  const status =
    typeof st === 'string' && validStatuses.includes(st)
      ? (st as PropertyInquiryStatus)
      : 'pending_approval'

  const pageRaw = parseNum(query.page)
  const page = pageRaw != null && pageRaw >= 1 ? Math.trunc(pageRaw) : 1
  const pageSizeRaw = parseNum(query.page_size)
  const page_size =
    pageSizeRaw != null && pageSizeRaw >= 1 && pageSizeRaw <= 50
      ? Math.trunc(pageSizeRaw)
      : PROPERTY_INQUIRY_LIST_PAGE_SIZE

  return { listing, status, page, page_size }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyPropertyInquiryFilters(query: any, filters: PropertyInquiryQueryFilters) {
  return query.eq('status', filters.status).eq('listing_type', filters.listing)
}
