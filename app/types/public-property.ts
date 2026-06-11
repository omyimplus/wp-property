import type { Property, PropertyType } from '~/types/property'
import type { ListingTab } from '~/types/property'

export type PublicPropertyListItem = Property & {
  cover_url: string | null
  image_urls: string[]
  image_count: number
}

export interface PublicPropertyListResponse {
  properties: PublicPropertyListItem[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface PublicPropertySearchQuery {
  listing?: ListingTab | 'sale' | 'rent'
  property_type?: PropertyType | ''
  min_price?: number
  max_price?: number
  keyword?: string
  page?: number
  page_size?: number
}

export function formatPropertyPrice(value: number | null | undefined): string {
  if (value == null) return '-'
  return value.toLocaleString('th-TH')
}

export function propertyLocationLine(p: Pick<Property, 'subdistrict' | 'district' | 'province'>): string {
  return [p.subdistrict, p.district, p.province].filter(Boolean).join(' ')
}

export function parsePriceRangeKey(key: string): { min?: number, max?: number } {
  if (key === '1-2') return { min: 1_000_000, max: 2_000_000 }
  if (key === '2-5') return { min: 2_000_000, max: 5_000_000 }
  if (key === '5+') return { min: 5_000_000 }
  return {}
}
