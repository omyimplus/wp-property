export interface PropertyAddressParts {
  house_number?: string | null
  address_line?: string | null
  soi?: string | null
  moo?: string | null
  road?: string | null
  subdistrict?: string | null
  district?: string | null
  province?: string | null
}

const PLACEHOLDER_ADDRESS_PARTS = new Set(['-', '—', 'n/a', 'na', 'null', 'none', '.'])

function isMeaningfulAddressPart(part: string | null | undefined): part is string {
  const trimmed = part?.trim()
  if (!trimmed) return false
  return !PLACEHOLDER_ADDRESS_PARTS.has(trimmed.toLowerCase())
}

function formatAddressSegment(
  value: string | null | undefined,
  prefix = '',
): string | null {
  if (!isMeaningfulAddressPart(value)) return null
  return `${prefix}${value.trim()}`
}

export function formatPropertyStreetAddress(parts: PropertyAddressParts): string {
  const segments = [
    formatAddressSegment(parts.house_number),
    formatAddressSegment(parts.road, 'ถนน'),
    formatAddressSegment(parts.soi, 'ซอย'),
    formatAddressSegment(parts.moo, 'หมู่'),
    formatAddressSegment(parts.subdistrict),
    formatAddressSegment(parts.district),
    formatAddressSegment(parts.province),
  ].filter(Boolean)

  return segments.join(' ')
}

export function buildPropertyGeocodeQuery(parts: PropertyAddressParts): string {
  const segments = [
    parts.house_number,
    parts.road ? `ถนน${parts.road}` : null,
    parts.soi ? `ซอย${parts.soi}` : null,
    parts.moo ? `หมู่${parts.moo}` : null,
    parts.subdistrict,
    parts.district,
    parts.province,
    parts.address_line,
    'ประเทศไทย',
  ]
    .map(part => part?.trim())
    .filter(Boolean)

  return [...new Set(segments)].join(', ')
}

export function hasMapCoordinates(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): boolean {
  return latitude != null && longitude != null && Number.isFinite(latitude) && Number.isFinite(longitude)
}

export function googleMapsPinUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`
}

export function googleMapsEmbedUrl(latitude: number, longitude: number): string {
  return `https://maps.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`
}
