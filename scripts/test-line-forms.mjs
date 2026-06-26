#!/usr/bin/env node
/**
 * ทดสอบฟอร์ม public ครบฟิลด์ + ส่ง LINE notify
 * ต้องรัน: npm run dev (และตั้งค่า LINE ใน .env)
 * ใช้: node scripts/test-line-forms.mjs
 */
import { loadEnvFile } from './load-env-file.mjs'

loadEnvFile('.env')

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const stamp = Date.now()
const tag = `LINE-AUDIT-${stamp}`

function lineConfig() {
  const token = process.env.NUXT_LINE_CHANNEL_ACCESS_TOKEN
  const groupId = process.env.NUXT_LINE_NOTIFY_GROUP_ID
  const userId = process.env.NUXT_LINE_NOTIFY_USER_ID
  const notifyToken = process.env.NUXT_LINE_NOTIFY_TOKEN
  if (token && groupId) return { mode: 'group', target: groupId }
  if (token && userId) return { mode: 'user', target: userId }
  if (notifyToken) return { mode: 'notify', target: '(LINE Notify token)' }
  return null
}

/** ฟอร์มที่อัปเดตวันนี้ — payload ครบทุกฟิลด์บังคับ */
const tests = [
  {
    name: 'consignments (ฝากขาย/ฝากเช่า)',
    path: '/api/public/consignments',
    body: {
      listing_mode: 'sale',
      property_type: 'house',
      customer_name: `${tag}-CONSIGN`,
      customer_phone: '0811111001',
      customer_line: 'line_audit_consign',
      listing_title: 'บ้านเดี่ยวทดสอบ LINE ครบฟิลด์',
      project_name: 'โครงการทดสอบ WP',
      house_number: '88/9',
      soi: 'สุขุมวิท 71',
      moo: '5',
      road: 'สุขุมวิท',
      province: 'กรุงเทพมหานคร',
      district: 'วัฒนา',
      subdistrict: 'คลองตันเหนือ',
      facing_direction: 'ตะวันออก',
      address_line: 'ใกล้ BTS พร้อมพงษ์ นัดชมวันหยุดได้',
      sale_price: 12500000,
      floors_total: 2,
      floor_number: 1,
      bedrooms: 4,
      bathrooms: 3,
      parking_spaces: 2,
      land_area_sqm: 50,
      usable_area_sqm: 220,
      property_age_years: 3,
      max_occupants: 6,
    },
    lineHints: ['ฝากขาย/เช่าทรัพย์', 'บ้านเดี่ยวทดสอบ', 'โครงการทดสอบ WP', 'พักอาศัยได้: 6'],
  },
  {
    name: 'rentals (สนใจเช่า)',
    path: '/api/public/rentals',
    body: {
      customer_name: `${tag}-RENT`,
      callback_phone: '0822222002',
      callback_line: 'line_audit_rent',
      desired_province: 'กรุงเทพมหานคร',
      desired_district: 'วัฒนา',
      desired_subdistrict: 'คลองตัน',
      desired_area_detail: 'ใกล้ BTS อโศก หรือ MRT สุขุมวิท',
      rent_budget_min: 10001,
      rent_budget_max: 15000,
      desired_bedrooms: 2,
      desired_bathrooms: 2,
      desired_parking_spaces: 1,
      lease_duration: '1 ปี (ต่อสัญญาได้)',
      max_occupants: 3,
    },
    lineHints: ['คำขอสนใจเช่า', 'BTS อโศก', 'ห้องนอน: 2', '1 ปี', 'พักอาศัยได้: 3'],
  },
  {
    name: 'sales (สนใจซื้อ)',
    path: '/api/public/sales',
    body: {
      customer_name: `${tag}-SALE`,
      callback_phone: '0833333003',
      callback_line: 'line_audit_sale',
      desired_province: 'กรุงเทพมหานคร',
      desired_district: 'บางกะปิ',
      desired_subdistrict: 'คลองจั่น',
      desired_area_detail: 'ใกล้รถไฟฟ้า ต้องการบ้านเดี่ยว',
      purchase_budget_min: 3_000_001,
      purchase_budget_max: 5_000_000,
      desired_bedrooms: 3,
      desired_bathrooms: 2,
      desired_parking_spaces: 2,
      desired_move_in: 'ภายใน 6 เดือน',
      max_occupants: 4,
    },
    lineHints: ['คำขอสนใจซื้อ', 'คลองจั่น', '3,000,000', 'ย้ายเข้า: ภายใน 6 เดือน'],
  },
  {
    name: 'loans (รวมหนี้)',
    path: '/api/public/loans',
    body: {
      customer_name: `${tag}-LOAN`,
      age: 35,
      callback_phone: '0844444004',
      callback_line: 'line_audit_loan',
      debt_amount: 850000,
      bureau_record: 'ไม่เคยติดบูโร / ปกติ',
      preferred_location: 'กรุงเทพฯ ฝั่งตะวันออก ใกล้รถไฟฟ้า',
      occupation_kind: 'employee',
      monthly_income: 55000,
    },
    lineHints: ['คำขอรวมหนี้', 'อายุ: 35', '850,000', 'ทำเลที่สนใจ'],
  },
]

async function main() {
  console.log('=== WP Property — ทดสอบฟอร์ม + LINE ===\n')
  console.log('BASE:', BASE)
  console.log('tag: ', tag)

  const line = lineConfig()
  if (!line) {
    console.warn('\n⚠️  ไม่พบ LINE config ใน .env — API บันทึกได้แต่จะไม่ส่ง LINE')
    console.warn('   ตั้ง NUXT_LINE_CHANNEL_ACCESS_TOKEN + NUXT_LINE_NOTIFY_GROUP_ID\n')
  } else {
    console.log(`LINE: ${line.mode} → ${line.target}\n`)
  }

  try {
    const health = await fetch(BASE)
    if (!health.ok) {
      console.error(`❌ Server ตอบ ${health.status} — รัน npm run dev ก่อน`)
      process.exit(1)
    }
  } catch {
    console.error('❌ ต่อ server ไม่ได้ — รัน npm run dev ก่อน')
    process.exit(1)
  }

  let failed = 0
  const results = []

  for (const test of tests) {
    process.stdout.write(`${test.name} ... `)
    try {
      const res = await fetch(`${BASE}${test.path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(test.body),
      })
      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch {
        data = null
      }

      if (!res.ok) {
        console.log(`FAIL HTTP ${res.status}`)
        console.log('  ', text.slice(0, 400))
        failed++
        results.push({ ...test, ok: false, error: text.slice(0, 200) })
        continue
      }

      const id = data?.consignment?.id
        ?? data?.rental?.id
        ?? data?.sale?.id
        ?? data?.loan?.id
        ?? data?.id
        ?? 'ok'
      console.log(`OK (id: ${String(id).slice(0, 8)}…)`)
      results.push({ ...test, ok: true, id })
    } catch (error) {
      console.log('FAIL', error instanceof Error ? error.message : error)
      failed++
      results.push({ ...test, ok: false, error: String(error) })
    }
  }

  console.log('\n--- สรุป ---')
  for (const r of results) {
    console.log(`${r.ok ? '✅' : '❌'} ${r.name}`)
    if (r.ok && r.lineHints?.length) {
      console.log(`   ตรวจใน LINE: ${r.lineHints.join(' | ')}`)
    }
    if (!r.ok) console.log(`   ${r.error}`)
  }

  console.log('')
  if (failed) {
    console.error(`❌ ${failed}/${tests.length} ฟอร์มล้มเหลว`)
    process.exit(1)
  }

  if (line) {
    console.log(`✅ ฟอร์มครบ ${tests.length} รายการ — เปิดกลุ่ม LINE ทีม`)
    console.log(`   ค้นหาข้อความที่มี "${tag}"`)
    console.log('   (ส่งแบบ async — รอ 2–5 วินาทีถ้ายังไม่เห็น)')
  } else {
    console.log(`✅ ฟอร์มครบ ${tests.length} รายการ (บันทึก DB แล้ว แต่ไม่ได้ส่ง LINE)`)
  }
}

main()
