export interface MapCoordinates {
  latitude: number
  longitude: number
}

function isValidCoordinate(lat: number, lng: number): boolean {
  return Number.isFinite(lat)
    && Number.isFinite(lng)
    && lat >= -90
    && lat <= 90
    && lng >= -180
    && lng <= 180
}

function toCoordinates(lat: number, lng: number): MapCoordinates | null {
  return isValidCoordinate(lat, lng) ? { latitude: lat, longitude: lng } : null
}

/** แยกพิกัดจาก URL หรือข้อความ Google Maps */
export function parseGoogleMapsCoordinates(input: string): MapCoordinates | null {
  const raw = input.trim()
  if (!raw) return null

  // พิกัดจุดจริง !3dLAT!4dLNG (แม่นที่สุด — รองรับ !8m2!3d...!4d...)
  const placeMatches = [...raw.matchAll(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/g)]
  if (placeMatches.length) {
    const last = placeMatches[placeMatches.length - 1]
    const result = toCoordinates(Number(last[1]), Number(last[2]))
    if (result) return result
  }

  // @lat,lng ใน URL
  const atMatch = raw.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (atMatch) {
    const result = toCoordinates(Number(atMatch[1]), Number(atMatch[2]))
    if (result) return result
  }

  // ?q=lat,lng หรือ &query=lat,lng
  const queryMatch = raw.match(/[?&](?:q|query)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (queryMatch) {
    const result = toCoordinates(Number(queryMatch[1]), Number(queryMatch[2]))
    if (result) return result
  }

  // ll=lat,lng
  const llMatch = raw.match(/[?&]ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (llMatch) {
    const result = toCoordinates(Number(llMatch[1]), Number(llMatch[2]))
    if (result) return result
  }

  // center=lat,lng
  const centerMatch = raw.match(/[?&]center=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (centerMatch) {
    const result = toCoordinates(Number(centerMatch[1]), Number(centerMatch[2]))
    if (result) return result
  }

  // วางเฉพาะพิกัด lat,lng
  const bareMatch = raw.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/)
  if (bareMatch) {
    const result = toCoordinates(Number(bareMatch[1]), Number(bareMatch[2]))
    if (result) return result
  }

  return null
}

export function isShortGoogleMapsUrl(input: string): boolean {
  try {
    const host = new URL(input.trim()).hostname.replace(/^www\./, '')
    return host === 'maps.app.goo.gl'
      || host === 'goo.gl'
      || host === 'g.co'
  } catch {
    return false
  }
}

export function isLikelyGoogleMapsUrl(input: string): boolean {
  const raw = input.trim()
  if (!raw) return false
  if (parseGoogleMapsCoordinates(raw)) return true
  if (isShortGoogleMapsUrl(raw)) return true
  return /google\.[a-z.]+\/maps|maps\.google/i.test(raw)
}
