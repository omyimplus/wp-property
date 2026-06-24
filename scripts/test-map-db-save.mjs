import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

const url = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  || process.env.SUPABASE_SERVICE_KEY
  || process.env.NUXT_SUPABASE_SECRET_KEY

if (!url || !key) {
  console.log('ข้าม DB test: ไม่พบ SUPABASE_URL / SERVICE_ROLE_KEY ใน .env')
  process.exit(0)
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: ws },
})

const { data: row, error: fetchErr } = await supabase
  .from('properties')
  .select('id, latitude, longitude')
  .limit(1)
  .maybeSingle()

if (fetchErr || !row) {
  console.error('✗ โหลดทรัพย์ไม่ได้:', fetchErr?.message ?? 'ไม่มีข้อมูล')
  process.exit(1)
}

const original = { latitude: row.latitude, longitude: row.longitude }
const testCoords = { latitude: 13.756331, longitude: 100.501762 }

const { error: updateErr } = await supabase
  .from('properties')
  .update(testCoords)
  .eq('id', row.id)

if (updateErr) {
  console.error('✗ บันทึกพิกัดไม่สำเร็จ:', updateErr.message)
  process.exit(1)
}

const { data: saved, error: readErr } = await supabase
  .from('properties')
  .select('latitude, longitude')
  .eq('id', row.id)
  .single()

if (readErr || !saved) {
  console.error('✗ อ่านกลับไม่ได้:', readErr?.message)
  process.exit(1)
}

const latOk = Number(saved.latitude) === testCoords.latitude
const lngOk = Number(saved.longitude) === testCoords.longitude

if (!latOk || !lngOk) {
  console.error('✗ พิกัดไม่ตรง:', saved)
  process.exit(1)
}

console.log('✓ บันทึกและอ่านพิกัดจาก DB สำเร็จ:', saved.latitude, saved.longitude)

await supabase.from('properties').update(original).eq('id', row.id)
console.log('✓ คืนค่าเดิมแล้ว')
