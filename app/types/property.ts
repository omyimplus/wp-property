export type PropertyType = 'house' | 'condo' | 'apartment' | 'commercial' | 'townhouse'
export type PropertyStatus = 'draft' | 'pending_approval' | 'published' | 'rejected'
/** system = สร้างจากระบบหลังบ้าน, customer_web = ลูกค้าฝากขายผ่านเว็บ */
export type PropertySource = 'system' | 'customer_web'
export type PropertySourceFilter = PropertySource | ''
export type ListingTab = 'all' | 'sale' | 'rent'
export type ListingMode = 'sale' | 'rent'

export interface PropertyImage {
  id: string
  property_id: string
  storage_path: string
  sort_order: number
  created_at: string
  public_url?: string
}

export interface Property {
  id: string
  property_code: string
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
  status: PropertyStatus
  property_source: PropertySource
  created_by: string | null
  created_at: string
  updated_at: string
  images?: PropertyImage[]
}

export type PropertyFormData = Omit<
  Property,
  'id' | 'created_by' | 'created_at' | 'updated_at' | 'images'
> & {
  listing_mode: ListingMode
}

export const LISTING_MODES: { value: ListingMode; label: string }[] = [
  { value: 'sale', label: 'ขาย' },
  { value: 'rent', label: 'เช่า' },
]

export interface PropertyListFilters {
  listing: ListingTab
  status: PropertyStatus
  property_source: PropertySourceFilter
  property_type: PropertyType | ''
  min_price: string
  max_price: string
  province: string
  district: string
  subdistrict: string
}

export const PROPERTY_STATUS_TABS: { id: PropertyStatus; label: string }[] = [
  { id: 'draft', label: 'ฉบับร่าง' },
  { id: 'pending_approval', label: 'รออนุมัติ' },
  { id: 'published', label: 'อนุมัติ' },
  { id: 'rejected', label: 'ไม่อนุมัติ' },
]

export const PROPERTY_LIST_PAGE_SIZE = 12

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'house', label: 'บ้าน' },
  { value: 'condo', label: 'คอนโด' },
  { value: 'apartment', label: 'อพาร์ตเมนต์' },
  { value: 'commercial', label: 'อาคารพาณิชย์' },
  { value: 'townhouse', label: 'ทาวน์เฮ้าส์' },
]

export const PROPERTY_SOURCES: { value: PropertySource; label: string }[] = [
  { value: 'system', label: 'สร้างจากระบบ' },
  { value: 'customer_web', label: 'ลูกค้าฝากขายผ่านเว็บ' },
]

export const PROPERTY_SOURCE_FILTER_OPTIONS: { value: PropertySourceFilter; label: string }[] = [
  { value: '', label: 'ทั้งหมด' },
  ...PROPERTY_SOURCES,
]

export const PROPERTY_STATUSES: { value: PropertyStatus; label: string }[] = [
  { value: 'draft', label: 'ฉบับร่าง' },
  { value: 'pending_approval', label: 'รออนุมัติ' },
  { value: 'published', label: 'อนุมัติ' },
  { value: 'rejected', label: 'ไม่อนุมัติ' },
]

export const RENT_DEPOSIT_MONTHS = [1, 2, 3, 4, 5, 6] as const

export const FACING_DIRECTIONS = [
  { value: 'เหนือ', label: 'เหนือ' },
  { value: 'ใต้', label: 'ใต้' },
  { value: 'ตะวันออก', label: 'ตะวันออก' },
  { value: 'ตะวันตก', label: 'ตะวันตก' },
] as const

export type FacingDirection = (typeof FACING_DIRECTIONS)[number]['value']

/** ตรวจข้อมูลบังคับตอนสร้างทรัพย์ใหม่ — คืนข้อความ error หรือ null ถ้าผ่าน */
export function validatePropertyCreateForm(data: PropertyFormData): string | null {
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

export function propertyTypeLabel(type: PropertyType): string {
  return PROPERTY_TYPES.find(t => t.value === type)?.label ?? type
}

export function propertyStatusLabel(status: PropertyStatus): string {
  return PROPERTY_STATUSES.find(s => s.value === status)?.label ?? status
}

export function propertySourceLabel(source: PropertySource): string {
  return PROPERTY_SOURCES.find(s => s.value === source)?.label ?? source
}

/** แสดงหัวข้อรายการ เช่น (WP-0001) บ้านเดี่ยวใกล้สนามบิน */
export function propertyListingHeadline(p: {
  property_code: string
  listing_title?: string | null
}): string {
  const title = p.listing_title?.trim()
  if (title) return `(${p.property_code}) ${title}`
  return p.property_code
}

export function propertyToFormData(p: Property): PropertyFormData {
  const { id: _id, created_by, created_at, updated_at, images: _img, ...rest } = p
  return {
    ...rest,
    listing_mode: p.for_rent && !p.for_sale ? 'rent' : 'sale',
  }
}

export function emptyPropertyForm(): PropertyFormData {
  return {
    property_code: '',
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
    status: 'draft',
    property_source: 'system',
  }
}

export function emptyPropertyFilters(): PropertyListFilters {
  return {
    listing: 'all',
    status: 'pending_approval',
    property_source: '',
    property_type: '',
    min_price: '',
    max_price: '',
    province: '',
    district: '',
    subdistrict: '',
  }
}

export function formatThaiPrice(value: number | null | undefined, suffix = 'บาท') {
  if (value == null) return '—'
  return `${new Intl.NumberFormat('th-TH').format(value)} ${suffix}`
}
