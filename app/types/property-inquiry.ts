import type { LoanCreatedSource } from '~/types/loan-application'

export type PropertyInquiryStatus = 'pending_approval' | 'rejected' | 'completed'
export type PropertyInquiryListingType = 'sale' | 'rent'

export interface PropertyInquiryFormData {
  listing_type: PropertyInquiryListingType | ''
  customer_name: string
  callback_phone: string
  callback_line: string
  note: string
}

export interface PropertyInquiry {
  id: string
  property_id: string | null
  property_code: string
  listing_type: PropertyInquiryListingType
  listing_title: string | null
  project_name: string | null
  property_url: string | null
  customer_name: string
  callback_phone: string
  callback_line: string
  note: string | null
  status: PropertyInquiryStatus
  created_source: LoanCreatedSource
  handled_by: string | null
  handled_at: string | null
  created_at: string
  updated_at: string
}

export type PropertyInquiryListItem = PropertyInquiry & {
  handled_by_name: string | null
  handled_by_email: string | null
}

export interface PropertyInquiryListFilters {
  listing: PropertyInquiryListingType
  status: PropertyInquiryStatus
}

export const PROPERTY_INQUIRY_LIST_PAGE_SIZE = 20

export const PROPERTY_INQUIRY_LISTING_TABS: { id: PropertyInquiryListingType, label: string }[] = [
  { id: 'sale', label: 'ขาย' },
  { id: 'rent', label: 'เช่า' },
]

export const PROPERTY_INQUIRY_STATUS_TABS: { id: PropertyInquiryStatus, label: string }[] = [
  { id: 'pending_approval', label: 'รอติดต่อ' },
  { id: 'completed', label: 'ติดต่อแล้ว' },
  { id: 'rejected', label: 'ปิด' },
]

export const PROPERTY_INQUIRY_STATUSES: { value: PropertyInquiryStatus, label: string }[] = [
  { value: 'pending_approval', label: 'รอติดต่อ' },
  { value: 'completed', label: 'ติดต่อแล้ว' },
  { value: 'rejected', label: 'ปิด' },
]

export function propertyInquiryStatusLabel(status: PropertyInquiryStatus): string {
  return PROPERTY_INQUIRY_STATUSES.find(s => s.value === status)?.label ?? status
}

export function propertyInquiryListingLabel(listing: PropertyInquiryListingType): string {
  return PROPERTY_INQUIRY_LISTING_TABS.find(t => t.id === listing)?.label ?? listing
}

export function emptyPropertyInquiryForm(defaultListing: PropertyInquiryListingType = 'sale'): PropertyInquiryFormData {
  return {
    listing_type: defaultListing,
    customer_name: '',
    callback_phone: '',
    callback_line: '',
    note: '',
  }
}

export function emptyPropertyInquiryFilters(
  listing: PropertyInquiryListingType = 'sale',
): PropertyInquiryListFilters {
  return { listing, status: 'pending_approval' }
}

export function validatePropertyInquiryForm(data: PropertyInquiryFormData): string | null {
  if (data.listing_type !== 'sale' && data.listing_type !== 'rent') return 'listingTypeRequired'
  if (!data.customer_name?.trim()) return 'nameRequired'
  if (!data.callback_phone?.trim()) return 'phoneRequired'
  if (!data.callback_line?.trim()) return 'lineRequired'
  return null
}

export function propertyInquiryHeadline(row: Pick<PropertyInquiry, 'property_code' | 'listing_title' | 'project_name'>): string {
  if (row.property_code === 'SERVICE-RENT') {
    return row.listing_title?.trim() || 'ฝากเช่าจากเว็บ'
  }
  const title = row.listing_title?.trim() || row.project_name?.trim()
  if (title) return `(${row.property_code}) ${title}`
  return row.property_code
}
