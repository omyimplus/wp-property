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

export function propertyLocationLine(
  p: Pick<Property, 'subdistrict' | 'district' | 'province'>,
  locale = 'th',
): string {
  const isTh = locale.startsWith('th')
  const parts: string[] = []

  if (p.subdistrict?.trim()) {
    parts.push(isTh ? `ต.${p.subdistrict.trim()}` : p.subdistrict.trim())
  }
  if (p.district?.trim()) {
    parts.push(isTh ? `อ.${p.district.trim()}` : p.district.trim())
  }
  if (p.province?.trim()) {
    parts.push(isTh ? `จ.${p.province.trim()}` : p.province.trim())
  }

  return parts.join(' ')
}

export function sqmToSqWah(sqm: number): number {
  return Math.round((sqm / 4) * 100) / 100
}

export function propertyPricePerSqm(
  price: number | null | undefined,
  areaSqm: number | null | undefined,
): string | null {
  if (price == null || areaSqm == null || areaSqm <= 0) return null
  return (price / areaSqm).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatPropertyPostedAt(
  iso: string,
  locale: string,
): { date: string, relative: string } | null {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null

  const isTh = locale.startsWith('th')
  const date = d.toLocaleDateString(isTh ? 'th-TH' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000)
  let relative: string
  if (days < 1) {
    relative = isTh ? 'วันนี้' : 'today'
  } else if (days < 7) {
    relative = isTh ? `${days} วันที่แล้ว` : `${days}d ago`
  } else if (days < 30) {
    const weeks = Math.floor(days / 7)
    relative = isTh ? `${weeks} สัปดาห์ที่แล้ว` : `${weeks}w ago`
  } else if (days < 365) {
    const months = Math.floor(days / 30)
    relative = isTh ? `${months} เดือนที่แล้ว` : `${months}mo ago`
  } else {
    const years = Math.floor(days / 365)
    relative = isTh ? `${years} ปีที่แล้ว` : `${years}y ago`
  }

  return { date, relative }
}

export const SALE_PRICE_RANGE_KEYS = [
  'lt-1',
  '1-2',
  '2-3',
  '3-5',
  '5-7',
  '7-10',
  '10+',
] as const

export type SalePriceRangeKey = (typeof SALE_PRICE_RANGE_KEYS)[number]

export const RENT_PRICE_RANGE_KEYS = [
  'lte-5k',
  '5001-10000',
  '10001-15000',
  '15001-20000',
  '20001-30000',
  '30001-50000',
  '50001-100000',
  '100001+',
] as const

export type RentPriceRangeKey = (typeof RENT_PRICE_RANGE_KEYS)[number]

export function parsePriceRangeKey(
  key: string,
  listing: 'sale' | 'rent' = 'sale',
): { min?: number, max?: number } {
  if (listing === 'rent') {
    if (key === 'lte-5k') return { max: 5_000 }
    if (key === '5001-10000') return { min: 5_001, max: 10_000 }
    if (key === '10001-15000') return { min: 10_001, max: 15_000 }
    if (key === '15001-20000') return { min: 15_001, max: 20_000 }
    if (key === '20001-30000') return { min: 20_001, max: 30_000 }
    if (key === '30001-50000') return { min: 30_001, max: 50_000 }
    if (key === '50001-100000') return { min: 50_001, max: 100_000 }
    if (key === '100001+') return { min: 100_001 }
    return {}
  }

  if (key === 'lt-1') return { max: 999_999 }
  if (key === '1-2') return { min: 1_000_000, max: 2_000_000 }
  if (key === '2-3') return { min: 2_000_000, max: 3_000_000 }
  if (key === '3-5') return { min: 3_000_000, max: 5_000_000 }
  if (key === '5-7') return { min: 5_000_000, max: 7_000_000 }
  if (key === '7-10') return { min: 7_000_000, max: 10_000_000 }
  if (key === '10+') return { min: 10_000_000 }
  return {}
}
