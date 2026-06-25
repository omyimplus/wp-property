#!/usr/bin/env node
/**
 * ทดสอบว่าทุกฟอร์ม public บันทึกได้ และเรียก LINE notify (ต้องรัน npm run dev ก่อน)
 * ใช้: node scripts/test-line-forms.mjs
 */
import { loadEnvFile } from './load-env-file.mjs'

loadEnvFile('.env')

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const stamp = Date.now()

const tests = [
  {
    name: 'property-inquiries',
    path: '/api/public/property-inquiries',
    body: {
      listing_type: 'sale',
      customer_name: `LINE-AUDIT-INQUIRY-${stamp}`,
      callback_phone: '0812345678',
      callback_line: 'audit_inquiry',
      note: 'ทดสอบฟิลด์ note',
      property_code: 'WP-0002',
      listing_title: 'ทดสอบสนใจทรัพย์',
      for_sale: true,
      for_rent: true,
      sale_price: 5000000,
      rent_price: 25000,
      subdistrict: 'คลองจั่น',
      district: 'บางกะปิ',
      province: 'กรุงเทพมหานคร',
    },
    expectInLine: ['ประเภท: ขาย', 'WP-0002', 'ทดสอบฟิลด์ note'],
  },
  {
    name: 'sales',
    path: '/api/public/sales',
    body: {
      customer_name: `LINE-AUDIT-SALE-${stamp}`,
      callback_phone: '0822222222',
      callback_line: 'audit_sale',
      desired_province: 'กรุงเทพมหานคร',
      desired_district: 'บางกะปิ',
      desired_subdistrict: 'คลองจั่น',
      desired_area_detail: 'ใกล้ BTS',
      purchase_budget_min: 2000000,
      purchase_budget_max: 3500000,
    },
    expectInLine: ['คำขอสนใจซื้อ', 'ใกล้ BTS', '2,000,000'],
  },
  {
    name: 'rentals',
    path: '/api/public/rentals',
    body: {
      customer_name: `LINE-AUDIT-RENT-${stamp}`,
      callback_phone: '0833333333',
      callback_line: 'audit_rent',
      desired_province: 'กรุงเทพมหานคร',
      desired_district: 'วัฒนา',
      desired_subdistrict: 'คลองตัน',
      desired_area_detail: 'ใกล้ BTS อโศก',
      rent_budget_min: 15000,
      rent_budget_max: 25000,
    },
    expectInLine: ['คำขอสนใจเช่า', 'BTS อโศก', 'บาท/เดือน'],
  },
  {
    name: 'loans',
    path: '/api/public/loans',
    body: {
      customer_name: `LINE-AUDIT-LOAN-${stamp}`,
      callback_phone: '0844444444',
      callback_line: 'audit_loan',
      debt_amount: 500000,
      creditor_count: 2,
      residence_province: 'กรุงเทพมหานคร',
      residence_district: 'บางกะปิ',
      residence_subdistrict: 'คลองจั่น',
      residence_detail: 'คอนโด',
      occupation_kind: 'employee',
      monthly_income: 45000,
    },
    expectInLine: ['คำขอสินเชื่อ', '500,000', 'พนักงานบริษัท'],
  },
  {
    name: 'consignments',
    path: '/api/public/consignments',
    body: {
      listing_mode: 'sale',
      property_type: 'condo',
      customer_name: `LINE-AUDIT-CONSIGN-${stamp}`,
      customer_phone: '0855555555',
      customer_line: 'audit_consign',
      listing_title: 'คอนโดทดสอบ LINE',
      house_number: '99/1',
      soi: 'สุขุม',
      province: 'กรุงเทพมหานคร',
      district: 'บางกะปิ',
      subdistrict: 'คลองจั่น',
      sale_price: 2800000,
      bedrooms: 2,
      bathrooms: 1,
      usable_area_sqm: 45,
      project_description: 'วิวดี ใกล้รถไฟฟ้า',
    },
    expectInLine: ['ฝากขาย', 'คอนโด', 'ซอยสุขุม', 'ห้องนอน: 2'],
  },
]

let failed = 0

for (const test of tests) {
  process.stdout.write(`${test.name} ... `)
  try {
    const res = await fetch(`${BASE}${test.path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(test.body),
    })
    const text = await res.text()
    if (!res.ok) {
      console.log(`FAIL HTTP ${res.status}`)
      console.log(text.slice(0, 300))
      failed++
      continue
    }
    console.log('OK')
  } catch (error) {
    console.log('FAIL', error instanceof Error ? error.message : error)
    failed++
  }
}

console.log('')
if (failed) {
  console.error(`❌ ${failed}/${tests.length} ฟอร์มล้มเหลว`)
  process.exit(1)
}

console.log(`✅ ฟอร์มครบ ${tests.length} รายการ — ตรวจ LINE แชท OA ว่ามีข้อความ ${tests.length} ชุด`)
console.log('   (ชื่อลูกค้าขึ้นต้น LINE-AUDIT-...)')
