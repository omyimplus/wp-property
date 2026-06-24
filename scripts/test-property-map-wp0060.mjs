#!/usr/bin/env node
/**
 * ทดสอบบันทึกตำแหน่งแผนที่ทรัพย์ WP-0060 (แอดมิน)
 *
 * ใช้:
 *   npm run test:site:setup
 *   node scripts/test-property-map-wp0060.mjs
 *
 * อ่าน credentials จาก docs/testing.md หรือ .env.test
 */
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright'
import { loadEnvFile } from './load-env-file.mjs'

loadEnvFile('.env.test')
loadEnvFile('.env')

const localBrowsersPath = join(process.cwd(), '.playwright-browsers')
if (!process.env.PLAYWRIGHT_BROWSERS_PATH && existsSync(localBrowsersPath)) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = localBrowsersPath
}

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const TEST_EMAIL = process.env.TEST_EMAIL || 'tester@gmail.com'
const TEST_PASSWORD = process.env.TEST_PASSWORD || '123456789'
const PROPERTY_CODE = process.env.TEST_PROPERTY_CODE || 'WP-0060'
const MAP_URL = process.env.TEST_MAP_URL
  || 'https://www.google.com/maps/place/19%C2%B049\'20.6%22N+99%C2%B050\'37.8%22E/@19.822405,99.8412701,17z/data=!3m1!4b1!4m4!3m3!8m2!3d19.8224!4d99.843845?entry=ttu'

const EXPECTED_LAT = 19.8224
const EXPECTED_LNG = 99.843845

function closeEnough(a, b, eps = 0.0001) {
  return Math.abs(a - b) <= eps
}

async function main() {
  console.log(`BASE_URL=${BASE_URL}`)
  console.log(`ทรัพย์=${PROPERTY_CODE} user=${TEST_EMAIL}`)

  const browser = await chromium.launch({ headless: process.env.HEADLESS !== '0' })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Login
    await page.goto(`${BASE_URL}/admin/login`)
    await page.getByLabel('อีเมล').fill(TEST_EMAIL)
    await page.getByLabel('รหัสผ่าน').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click()
    await page.waitForTimeout(2000)
    const loginError = await page.locator('[role="alert"]').textContent().catch(() => '')
    if (page.url().includes('/admin/login')) {
      throw new Error(loginError?.trim() || 'เข้าสู่ระบบไม่สำเร็จ — ตรวจสอบบัญชีใน docs/testing.md')
    }
    await page.waitForURL(/\/admin/, { timeout: 15000 })

    // Find property id
    const listRes = await page.request.get(`${BASE_URL}/api/admin/properties?limit=500`)
    if (!listRes.ok()) throw new Error(`โหลดรายการทรัพย์ไม่ได้: ${listRes.status()}`)
    const listBody = await listRes.json()
    const property = (listBody.properties || []).find(p => p.property_code === PROPERTY_CODE)
    if (!property?.id) throw new Error(`ไม่พบทรัพย์ ${PROPERTY_CODE}`)

    console.log(`พบทรัพย์ id=${property.id}`)

    await page.goto(`${BASE_URL}/admin/properties/${property.id}/edit`)
    await page.waitForSelector('text=ตำแหน่งบนแผนที่', { timeout: 15000 })

    const mapInput = page.locator('input[placeholder*="google.com/maps"]')
    await mapInput.fill(MAP_URL)
    await page.getByRole('button', { name: 'บันทึกตำแหน่ง' }).click()

    await page.waitForSelector('text=บันทึกตำแหน่งสำเร็จ', { timeout: 10000 })
    const coordText = await page.locator('text=พิกัด:').locator('..').textContent()
    console.log('พิกัดในฟอร์ม:', coordText?.trim())

    await page.getByRole('button', { name: 'บันทึกข้อมูล' }).click()
    await page.waitForSelector('text=บันทึกข้อมูลสำเร็จ', { timeout: 15000 })

    const detailRes = await page.request.get(`${BASE_URL}/api/admin/properties/${property.id}`)
    if (!detailRes.ok()) throw new Error(`โหลดทรัพย์หลังบันทึกไม่ได้: ${detailRes.status()}`)
    const { property: saved } = await detailRes.json()

    const lat = Number(saved.latitude)
    const lng = Number(saved.longitude)
    if (!closeEnough(lat, EXPECTED_LAT) || !closeEnough(lng, EXPECTED_LNG)) {
      throw new Error(`พิกัดไม่ตรง: got ${lat}, ${lng} expected ~${EXPECTED_LAT}, ${EXPECTED_LNG}`)
    }

    console.log(`✓ สำเร็จ — บันทึกพิกัด ${lat}, ${lng} ใน ${PROPERTY_CODE}`)
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error('✗', err.message || err)
  process.exit(1)
})
