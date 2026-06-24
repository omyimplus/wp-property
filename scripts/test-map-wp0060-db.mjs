#!/usr/bin/env node
/**
 * ทดสอบแยกพิกัด + บันทึก WP-0060 ผ่าน Supabase (ไม่ต้อง login)
 * ใช้เมื่อรัน E2E Playwright ไม่ได้ (บัญชี tester ยังไม่พร้อม)
 */
import { loadEnvFile } from './load-env-file.mjs'
import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

loadEnvFile('.env')

const MAP_URL = process.env.TEST_MAP_URL
  || "https://www.google.com/maps/place/19%C2%B049'20.6%22N+99%C2%B050'37.8%22E/@19.822405,99.8412701,17z/data=!3m1!4b1!4m4!3m3!8m2!3d19.8224!4d99.843845?entry=ttu"
const PROPERTY_CODE = process.env.TEST_PROPERTY_CODE || 'WP-0060'
const EXPECTED_LAT = 19.8224
const EXPECTED_LNG = 99.843845

function parseGoogleMapsCoordinates(input) {
  const raw = input.trim()
  const placeMatches = [...raw.matchAll(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/g)]
  if (placeMatches.length) {
    const last = placeMatches[placeMatches.length - 1]
    return { latitude: Number(last[1]), longitude: Number(last[2]) }
  }
  const atMatch = raw.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (atMatch) return { latitude: Number(atMatch[1]), longitude: Number(atMatch[2]) }
  return null
}

const url = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  || process.env.SUPABASE_SERVICE_KEY
  || process.env.NUXT_SUPABASE_SECRET_KEY

if (!url || !key) {
  console.error('ไม่พบ Supabase credentials')
  process.exit(1)
}

const coords = parseGoogleMapsCoordinates(MAP_URL)
if (!coords) {
  console.error('✗ แยกพิกัดจาก URL ไม่ได้')
  process.exit(1)
}
console.log('✓ แยกพิกัด:', coords.latitude, coords.longitude)

const sb = createClient(url, key, {
  auth: { persistSession: false },
  realtime: { transport: ws },
})

const { data: row, error: findErr } = await sb
  .from('properties')
  .select('id, property_code, latitude, longitude')
  .eq('property_code', PROPERTY_CODE)
  .maybeSingle()

if (findErr || !row) {
  console.error('✗ ไม่พบทรัพย์', PROPERTY_CODE, findErr?.message)
  process.exit(1)
}

console.log('ก่อนบันทึก:', row.latitude, row.longitude)

const { error: updateErr } = await sb
  .from('properties')
  .update({ latitude: coords.latitude, longitude: coords.longitude })
  .eq('id', row.id)

if (updateErr) {
  console.error('✗ บันทึกไม่สำเร็จ:', updateErr.message)
  process.exit(1)
}

const { data: saved } = await sb
  .from('properties')
  .select('latitude, longitude')
  .eq('id', row.id)
  .single()

const lat = Number(saved.latitude)
const lng = Number(saved.longitude)
if (Math.abs(lat - EXPECTED_LAT) > 0.0001 || Math.abs(lng - EXPECTED_LNG) > 0.0001) {
  console.error('✗ พิกัดไม่ตรง:', lat, lng)
  process.exit(1)
}

console.log(`✓ บันทึก ${PROPERTY_CODE} สำเร็จ — ${lat}, ${lng}`)
