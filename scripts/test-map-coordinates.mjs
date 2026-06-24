/**
 * ทดสอบแยกพิกัดและ payload บันทึกตำแหน่ง (ไม่มี validation คู่ lat/lng)
 * รัน: node scripts/test-map-coordinates.mjs
 */

function isValidCoordinate(lat, lng) {
  return Number.isFinite(lat)
    && Number.isFinite(lng)
    && lat >= -90
    && lat <= 90
    && lng >= -180
    && lng <= 180
}

function toCoordinates(lat, lng) {
  return isValidCoordinate(lat, lng) ? { latitude: lat, longitude: lng } : null
}

function parseGoogleMapsCoordinates(input) {
  const raw = input.trim()
  if (!raw) return null

  const placeMatch = raw.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/)
  if (placeMatch) {
    const result = toCoordinates(Number(placeMatch[1]), Number(placeMatch[2]))
    if (result) return result
  }

  const atMatch = raw.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (atMatch) {
    const result = toCoordinates(Number(atMatch[1]), Number(atMatch[2]))
    if (result) return result
  }

  const queryMatch = raw.match(/[?&](?:q|query)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (queryMatch) {
    const result = toCoordinates(Number(queryMatch[1]), Number(queryMatch[2]))
    if (result) return result
  }

  const bareMatch = raw.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/)
  if (bareMatch) {
    return toCoordinates(Number(bareMatch[1]), Number(bareMatch[2]))
  }

  return null
}

function parseOptionalCoordinate(v) {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function parseMapCoordinates(body) {
  return {
    latitude: parseOptionalCoordinate(body.latitude),
    longitude: parseOptionalCoordinate(body.longitude),
  }
}

const samples = [
  '13.7563, 100.5018',
  'https://www.google.com/maps/@13.756331,100.501762,17z',
  'https://www.google.com/maps/place/test/@13.7563,100.5018,17z/data=!3d13.756331!4d100.501762',
  "https://www.google.com/maps/place/19%C2%B049'20.6%22N+99%C2%B050'37.8%22E/@19.822405,99.8412701,17z/data=!3m1!4b1!4m4!3m3!8m2!3d19.8224!4d99.843845?entry=ttu",
]

let passed = 0
let failed = 0

function ok(label, condition) {
  if (condition) {
    passed++
    console.log(`✓ ${label}`)
  } else {
    failed++
    console.error(`✗ ${label}`)
  }
}

console.log('--- parseGoogleMapsCoordinates ---')
for (const sample of samples) {
  const coords = parseGoogleMapsCoordinates(sample)
  ok(`แยกพิกัดได้: ${sample.slice(0, 50)}...`, coords !== null)
  if (coords) {
    ok('lat อยู่ในช่วง', coords.latitude >= -90 && coords.latitude <= 90)
    ok('lng อยู่ในช่วง', coords.longitude >= -180 && coords.longitude <= 180)
  }
}

console.log('\n--- parseMapCoordinates (ไม่บังคับคู่) ---')
const both = parseMapCoordinates({ latitude: 13.7563, longitude: 100.5018 })
ok('บันทึก lat/lng ครบ', both.latitude === 13.7563 && both.longitude === 100.5018)

const latOnly = parseMapCoordinates({ latitude: 13.7563, longitude: null })
ok('lat เดี่ยวไม่ error', latOnly.latitude === 13.7563 && latOnly.longitude === null)

const lngOnly = parseMapCoordinates({ latitude: '', longitude: 100.5018 })
ok('lng เดี่ยวไม่ error', lngOnly.latitude === null && lngOnly.longitude === 100.5018)

const cleared = parseMapCoordinates({ latitude: null, longitude: null })
ok('ลบตำแหน่ง', cleared.latitude === null && cleared.longitude === null)

const fromStrings = parseMapCoordinates({ latitude: '13.7', longitude: '100.5' })
ok('รับ string จากฟอร์ม', fromStrings.latitude === 13.7 && fromStrings.longitude === 100.5)

console.log(`\nผลรวม: ${passed} ผ่าน, ${failed} ล้มเหลว`)
process.exit(failed > 0 ? 1 : 0)
