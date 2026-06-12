import { formatThaiPrice, type ListingMode, type PropertyType } from '~/types/property'

export type PropertyCustomerStatus = 'pending_approval' | 'rejected' | 'approved'
export type ListingTab = 'all' | 'sale' | 'rent'

export interface PropertyCustomerImage {
  id: string
  property_customer_id: string
  storage_path: string
  sort_order: number
  created_at: string
  public_url?: string
}

export interface PropertyCustomer {
  id: string
  customer_name: string
  customer_phone: string
  customer_line: string
  listing_title: string | null
  project_name: string | null
  property_type: PropertyType
  for_sale: boolean
  for_rent: boolean
  sale_price: number | null
  rent_price: number | null
  rent_deposit_months: number | null
  address_line: string | null
  house_number: string | null
  soi: string | null
  moo: string | null
  road: string | null
  subdistrict: string | null
  district: string | null
  province: string | null
  facing_direction: string | null
  floors_total: number | null
  floor_number: number | null
  bathrooms: number | null
  bedrooms: number | null
  parking_spaces: number | null
  land_area_sqm: number | null
  usable_area_sqm: number | null
  property_age_years: number | null
  status: PropertyCustomerStatus
  property_id: string | null
  approved_at: string | null
  approved_by: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  images?: PropertyCustomerImage[]
  /** จาก join หลังอนุมัติ */
  property_code?: string | null
}

export type PropertyCustomerFormData = Omit<
  PropertyCustomer,
  'id' | 'property_id' | 'approved_at' | 'approved_by' | 'created_by' | 'created_at' | 'updated_at' | 'images' | 'property_code'
> & {
  listing_mode: ListingMode
}

export interface PropertyCustomerListFilters {
  listing: ListingTab
  status: PropertyCustomerStatus
  property_type: PropertyType | ''
  min_price: string
  max_price: string
  province: string
  district: string
  subdistrict: string
}

export const PROPERTY_CUSTOMER_LIST_PAGE_SIZE = 12

export const PROPERTY_CUSTOMER_STATUS_TABS: { id: PropertyCustomerStatus; label: string }[] = [
  { id: 'pending_approval', label: 'รออนุมัติ' },
  { id: 'approved', label: 'อนุมัติแล้ว' },
  { id: 'rejected', label: 'ไม่อนุมัติ' },
]

export const PROPERTY_CUSTOMER_STATUSES: { value: PropertyCustomerStatus; label: string }[] = [
  { value: 'pending_approval', label: 'รออนุมัติ' },
  { value: 'approved', label: 'อนุมัติแล้ว' },
  { value: 'rejected', label: 'ไม่อนุมัติ' },
]

export function propertyCustomerStatusLabel(status: PropertyCustomerStatus): string {
  return PROPERTY_CUSTOMER_STATUSES.find(s => s.value === status)?.label ?? status
}

export function propertyCustomerHeadline(p: {
  listing_title?: string | null
  property_type: PropertyType
  house_number?: string | null
}): string {
  const title = p.listing_title?.trim()
  if (title) return title
  const parts = [p.house_number, p.property_type].filter(Boolean)
  return parts.length ? parts.join(' · ') : 'รายการฝากขาย'
}

export function propertyCustomerListingLabel(p: { for_sale: boolean; for_rent: boolean }): string {
  if (p.for_sale && p.for_rent) return 'ขาย / เช่า'
  if (p.for_rent) return 'เช่า'
  return 'ขาย'
}

export function propertyCustomerPriceText(p: {
  for_sale: boolean
  for_rent: boolean
  sale_price: number | null
  rent_price: number | null
  rent_deposit_months: number | null
}): string {
  if (p.for_rent && !p.for_sale) {
    const price = formatThaiPrice(p.rent_price, 'บาท/เดือน')
    const dep = p.rent_deposit_months ? ` · มัดจำ ${p.rent_deposit_months} เดือน` : ''
    return `${price}${dep}`
  }
  if (p.sale_price != null) return formatThaiPrice(p.sale_price)
  if (p.rent_price != null) return formatThaiPrice(p.rent_price, 'บาท/เดือน')
  return '—'
}

export function propertyCustomerAddressText(p: {
  house_number?: string | null
  address_line?: string | null
  soi?: string | null
  moo?: string | null
  road?: string | null
  subdistrict?: string | null
  district?: string | null
  province?: string | null
}): string {
  const parts = [
    p.house_number,
    p.address_line,
    p.soi ? `ซ.${p.soi}` : null,
    p.moo ? `ม.${p.moo}` : null,
    p.road ? `ถ.${p.road}` : null,
    p.subdistrict,
    p.district,
    p.province,
  ].filter(Boolean)
  return parts.length ? parts.join(' ') : '—'
}

export function propertyCustomerCreatedByLabel(created_by: string | null): string {
  return created_by ? 'พนักงานบันทึกในระบบ' : 'ลูกค้าส่งจากเว็บ'
}

export function formatPropertyCustomerDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })
}

export function propertyCustomerSpecText(value: number | null | undefined, unit: string): string {
  return value != null ? `${value} ${unit}` : '—'
}

export function propertyCustomerToFormData(p: PropertyCustomer): PropertyCustomerFormData {
  const {
    id: _id,
    property_id: _pid,
    approved_at: _aa,
    approved_by: _ab,
    created_by: _cb,
    created_at: _ca,
    updated_at: _ua,
    images: _img,
    property_code: _pc,
    ...rest
  } = p
  return {
    ...rest,
    listing_mode: p.for_rent && !p.for_sale ? 'rent' : 'sale',
  }
}

export function emptyPropertyCustomerForm(): PropertyCustomerFormData {
  return {
    customer_name: '',
    customer_phone: '',
    customer_line: '',
    listing_title: null,
    project_name: null,
    property_type: 'house',
    listing_mode: 'sale',
    for_sale: true,
    for_rent: false,
    sale_price: null,
    rent_price: null,
    rent_deposit_months: null,
    address_line: null,
    house_number: null,
    soi: null,
    moo: null,
    road: null,
    subdistrict: null,
    district: null,
    province: null,
    facing_direction: null,
    floors_total: null,
    floor_number: null,
    bathrooms: null,
    bedrooms: null,
    parking_spaces: null,
    land_area_sqm: null,
    usable_area_sqm: null,
    property_age_years: null,
    status: 'pending_approval',
  }
}

export function emptyPropertyCustomerFilters(): PropertyCustomerListFilters {
  return {
    listing: 'all',
    status: 'pending_approval',
    property_type: '',
    min_price: '',
    max_price: '',
    province: '',
    district: '',
    subdistrict: '',
  }
}

export function validatePropertyCustomerCreateForm(data: PropertyCustomerFormData): string | null {
  if (!data.customer_name?.trim()) return 'กรุณาระบุชื่อลูกค้า'
  if (!data.customer_phone?.trim()) return 'กรุณาระบุเบอร์โทร'
  if (!data.customer_line?.trim()) return 'กรุณาระบุไลน์'
  if (!data.house_number?.trim()) return 'กรุณาระบุบ้านเลขที่'
  if (!data.province?.trim()) return 'กรุณาเลือกจังหวัด'
  if (!data.district?.trim()) return 'กรุณาเลือกอำเภอ'
  if (!data.subdistrict?.trim()) return 'กรุณาเลือกตำบล'
  if (data.listing_mode === 'sale') {
    if (data.sale_price == null || data.sale_price <= 0) return 'กรุณาระบุราคาขาย'
  } else {
    if (data.rent_price == null || data.rent_price <= 0) return 'กรุณาระบุราคาเช่า'
    if (data.rent_deposit_months == null || data.rent_deposit_months < 1) {
      return 'กรุณาเลือกมัดจำ (เช่า)'
    }
  }
  return null
}

export function validatePropertyCustomerContact(data: PropertyCustomerFormData): string | null {
  if (!data.customer_name?.trim()) return 'กรุณาระบุชื่อลูกค้า'
  if (!data.customer_phone?.trim()) return 'กรุณาระบุเบอร์โทร'
  if (!data.customer_line?.trim()) return 'กรุณาระบุไลน์'
  return null
}
