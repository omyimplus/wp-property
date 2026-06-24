#!/usr/bin/env node
/**
 * E2E smoke test หน้าบ้าน + หลังบ้าน + API
 *
 * ใช้:
 *   npm run test:site:setup
 *   BASE_URL=https://wplandproperty.com TEST_EMAIL=... TEST_PASSWORD=... npm run test:site
 *
 * หรือสร้าง .env.test (ไม่ขึ้น Git) แล้วรัน npm run test:site
 */
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { chromium } from 'playwright'
import { loadEnvFile } from './load-env-file.mjs'
import { isIgnoredConsoleMessage } from './console-ignore.mjs'
import {
  ADMIN_API_ROUTES,
  ADMIN_EDIT_DISCOVERY,
  ADMIN_PAGE_ROUTES,
  PUBLIC_API_ROUTES,
  PUBLIC_META_ROUTES,
  PUBLIC_PAGE_ROUTES,
} from './site-routes.mjs'

loadEnvFile('.env.test')
loadEnvFile('.env')

const localBrowsersPath = join(process.cwd(), '.playwright-browsers')
if (!process.env.PLAYWRIGHT_BROWSERS_PATH && existsSync(localBrowsersPath)) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = localBrowsersPath
}

const BASE_URL = (process.env.BASE_URL || 'https://wplandproperty.com').replace(/\/$/, '')
const TEST_EMAIL = process.env.TEST_EMAIL || ''
const TEST_PASSWORD = process.env.TEST_PASSWORD || ''
const FAIL_ON_WARNINGS = process.env.FAIL_ON_WARNINGS !== '0'
const HEADLESS = process.env.HEADLESS !== '0'

/** @typedef {{ name: string, ok: boolean, detail?: string, skip?: boolean }} TestResult */

/** @type {TestResult[]} */
const results = []

function record(name, ok, detail = '', skip = false) {
  results.push({ name, ok, detail, skip })
  const icon = skip ? 'SKIP' : ok ? 'OK' : 'FAIL'
  const suffix = detail ? ` — ${detail}` : ''
  console.log(`  [${icon}] ${name}${suffix}`)
}

function pathOnHost(pathname) {
  return `${BASE_URL}${pathname}`
}

function pathnameFromUrl(url) {
  try {
    return new URL(url).pathname.replace(/\/$/, '') || '/'
  } catch {
    return url
  }
}

async function fetchJson(path, { apiContext } = {}) {
  const url = pathOnHost(path)
  let status = 0
  let contentType = ''
  let body = null
  let parseError = null

  try {
    if (apiContext) {
      const response = await apiContext.get(path)
      status = response.status()
      contentType = response.headers()['content-type'] || ''
      try {
        body = await response.json()
      } catch (error) {
        parseError = error instanceof Error ? error.message : 'invalid json'
      }
      return { status, contentType, body, parseError, url }
    }

    const response = await fetch(url, { headers: { accept: 'application/json' } })
    status = response.status
    contentType = response.headers.get('content-type') || ''
    try {
      body = await response.json()
    } catch (error) {
      parseError = error instanceof Error ? error.message : 'invalid json'
    }
  } catch (error) {
    parseError = error instanceof Error ? error.message : 'fetch failed'
  }

  return { status, contentType, body, parseError, url }
}

async function postJson(path, body) {
  const url = pathOnHost(path)
  let status = 0
  let bodyOut = null
  let parseError = null

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    status = response.status
    try {
      bodyOut = await response.json()
    } catch (error) {
      parseError = error instanceof Error ? error.message : 'invalid json'
    }
  } catch (error) {
    parseError = error instanceof Error ? error.message : 'fetch failed'
  }

  return { status, body: bodyOut, parseError, url }
}

async function postJsonAuth(apiContext, path, body) {
  let status = 0
  let bodyOut = null
  let parseError = null

  try {
    const response = await apiContext.post(path, {
      data: body,
      headers: { accept: 'application/json' },
    })
    status = response.status()
    try {
      bodyOut = await response.json()
    } catch (error) {
      parseError = error instanceof Error ? error.message : 'invalid json'
    }
  } catch (error) {
    parseError = error instanceof Error ? error.message : 'request failed'
  }

  return { status, body: bodyOut, parseError }
}

async function deleteAuth(apiContext, path) {
  try {
    const response = await apiContext.delete(path)
    return { status: response.status(), parseError: null }
  } catch (error) {
    return {
      status: 0,
      parseError: error instanceof Error ? error.message : 'request failed',
    }
  }
}

async function findPublishedPropertyCode(listing) {
  const { status, body, parseError } = await fetchJson(`/api/properties?listing=${listing}&page_size=5`)
  if (status >= 400 || parseError) return null
  const code = body?.properties?.[0]?.property_code
  return typeof code === 'string' && code.trim() ? code.trim() : null
}

async function testPublicFormPosts() {
  console.log('\nPublic form POST (smoke)')

  const contact = {
    customer_name: 'smoke-test',
    callback_phone: '0812345678',
    callback_line: 'smoke-line',
  }

  const loan = await postJson('/api/public/loans', {
    ...contact,
    debt_amount: 100000,
    creditor_count: 1,
    monthly_income: 30000,
    occupation_kind: 'employee',
    residence_province: 'กรุงเทพมหานคร',
    residence_district: 'บางรัก',
    residence_subdistrict: 'บางรัก',
  })
  record(
    'POST /api/public/loans',
    loan.status >= 200 && loan.status < 300 && loan.body?.loan?.id,
    loan.status >= 200 && loan.status < 300 ? `HTTP ${loan.status}` : loan.parseError || loan.body?.statusMessage || `HTTP ${loan.status}`,
  )

  const rental = await postJson('/api/public/rentals', {
    ...contact,
    rent_budget_min: 5000,
    rent_budget_max: 15000,
    desired_province: 'กรุงเทพมหานคร',
    desired_district: 'บางรัก',
    desired_subdistrict: 'บางรัก',
  })
  record(
    'POST /api/public/rentals',
    rental.status >= 200 && rental.status < 300 && rental.body?.rental?.id,
    rental.status >= 200 && rental.status < 300 ? `HTTP ${rental.status}` : rental.parseError || rental.body?.statusMessage || `HTTP ${rental.status}`,
  )

  const sale = await postJson('/api/public/sales', {
    ...contact,
    purchase_budget_min: 1000000,
    purchase_budget_max: 3000000,
    desired_province: 'กรุงเทพมหานคร',
    desired_district: 'บางรัก',
    desired_subdistrict: 'บางรัก',
  })
  record(
    'POST /api/public/sales',
    sale.status >= 200 && sale.status < 300 && sale.body?.sale?.id,
    sale.status >= 200 && sale.status < 300 ? `HTTP ${sale.status}` : sale.parseError || sale.body?.statusMessage || `HTTP ${sale.status}`,
  )

  const consign = await postJson('/api/public/consignments', {
    customer_name: contact.customer_name,
    customer_phone: contact.callback_phone,
    customer_line: contact.callback_line,
    listing_title: 'smoke consign',
    property_type: 'house',
    listing_mode: 'sale',
    sale_price: 1000000,
    house_number: '1',
    province: 'กรุงเทพมหานคร',
    district: 'บางรัก',
    subdistrict: 'บางรัก',
  })
  record(
    'POST /api/public/consignments',
    consign.status >= 200 && consign.status < 300 && consign.body?.consignment?.id,
    consign.status >= 200 && consign.status < 300 ? `HTTP ${consign.status}` : consign.parseError || consign.body?.statusMessage || `HTTP ${consign.status}`,
  )

  for (const listing of ['sale', 'rent']) {
    const propertyCode =
      listing === 'sale' && process.env.TEST_PROPERTY_CODE?.trim()
        ? process.env.TEST_PROPERTY_CODE.trim()
        : await findPublishedPropertyCode(listing)
    const label = listing === 'sale' ? 'ซื้อ' : 'เช่า'

    if (!propertyCode) {
      record(`POST /api/public/property-inquiries (${label})`, true, 'ไม่มีทรัพย์เผยแพร่ — ข้าม', true)
      continue
    }

    const inquiry = await postJson('/api/public/property-inquiries', {
      ...contact,
      listing_type: listing,
      property_code: propertyCode,
      note: `smoke ${listing}`,
    })
    const ok = inquiry.status >= 200 && inquiry.status < 300 && inquiry.body?.inquiry?.id
    record(
      `POST /api/public/property-inquiries (${label})`,
      ok,
      ok
        ? `HTTP ${inquiry.status} — ${propertyCode}`
        : inquiry.parseError || inquiry.body?.statusMessage || `HTTP ${inquiry.status}`,
    )
  }
}

async function testAdminPropertyInquiries(apiContext) {
  console.log('\nAdmin property inquiries (smoke)')

  for (const listing of ['sale', 'rent']) {
    const label = listing === 'sale' ? 'ซื้อ' : 'เช่า'
    const path = `/api/admin/property-inquiries?listing=${listing}&status=pending_approval&page=1`
    const { status, parseError, body } = await fetchJson(path, { apiContext })
    const ok = status >= 200 && status < 400 && !parseError && Array.isArray(body?.inquiries)
    const count = ok ? body.inquiries.length : 0
    record(
      `GET ${path}`,
      ok,
      ok ? `HTTP ${status} — ${count} รายการ` : parseError || `HTTP ${status}`,
    )
  }
}

async function testAdminArticleCreate(apiContext) {
  console.log('\nAdmin article create (smoke)')

  const stamp = Date.now()
  const slug = `smoke-test-${stamp}`
  const payload = {
    title: `Smoke test article ${stamp}`,
    slug,
    excerpt: 'สร้างจาก smoke test — ลบอัตโนมัติหลังทดสอบ',
    body_html: '<p>เนื้อหาทดสอบจาก smoke test</p>',
    status: 'draft',
    sort_order: 0,
  }

  const created = await postJsonAuth(apiContext, '/api/admin/articles', payload)
  const id = created.body?.item?.id
  const createOk = created.status >= 200 && created.status < 300 && id
  record(
    'POST /api/admin/articles',
    createOk,
    createOk
      ? `HTTP ${created.status} — ${slug}`
      : created.parseError || created.body?.statusMessage || `HTTP ${created.status}`,
  )

  if (!id) return

  const fetched = await fetchJson(`/api/admin/articles/${id}`, { apiContext })
  const fetchOk = fetched.status === 200 && fetched.body?.item?.slug === slug
  record(
    `GET /api/admin/articles/${id}`,
    fetchOk,
    fetchOk ? `HTTP ${fetched.status}` : fetched.parseError || `HTTP ${fetched.status}`,
  )

  const removed = await deleteAuth(apiContext, `/api/admin/articles/${id}`)
  const deleteOk = removed.status >= 200 && removed.status < 300
  record(
    `DELETE /api/admin/articles/${id}`,
    deleteOk,
    deleteOk ? `HTTP ${removed.status}` : removed.parseError || `HTTP ${removed.status}`,
  )
}

async function testPublicMeta() {
  console.log('\nPublic meta')
  for (const path of PUBLIC_META_ROUTES) {
    try {
      const res = await fetch(pathOnHost(path))
      record(`GET ${path}`, res.ok, res.ok ? `HTTP ${res.status}` : `HTTP ${res.status}`)
    } catch (error) {
      record(`GET ${path}`, false, error instanceof Error ? error.message : 'fetch failed')
    }
  }
}

async function testNuxtStaticAssets() {
  console.log('\nNuxt static assets')

  let html = ''
  try {
    const res = await fetch(pathOnHost('/'), { headers: { accept: 'text/html' } })
    html = await res.text()
    record('GET / (HTML for chunks)', res.ok, res.ok ? `HTTP ${res.status}` : `HTTP ${res.status}`)
  } catch (error) {
    record('GET / (HTML for chunks)', false, error instanceof Error ? error.message : 'fetch failed')
    return
  }

  const chunks = [...new Set(html.match(/\/_nuxt\/[A-Za-z0-9_-]+\.js/g) ?? [])].slice(0, 3)
  if (!chunks.length) {
    record('Nuxt entry chunks', false, 'ไม่พบ /_nuxt/*.js ใน HTML')
    return
  }

  for (const chunkPath of chunks) {
    try {
      const res = await fetch(pathOnHost(chunkPath), {
        headers: { accept: '*/*', 'accept-encoding': 'identity' },
      })
      const contentType = res.headers.get('content-type') || ''
      const isJs = /javascript|ecmascript/i.test(contentType)
      const ok = res.ok && isJs
      record(
        `GET ${chunkPath}`,
        ok,
        ok ? `HTTP ${res.status}` : `HTTP ${res.status} (${contentType || 'no content-type'})`,
      )
    } catch (error) {
      record(`GET ${chunkPath}`, false, error instanceof Error ? error.message : 'fetch failed')
    }
  }
}

async function testPublicApis() {
  console.log('\nPublic API')
  for (const route of PUBLIC_API_ROUTES) {
    const { status, parseError, body } = await fetchJson(route.path)
    const ok = status >= 200 && status < 400 && !parseError
    record(
      `GET ${route.path}`,
      ok,
      ok ? `HTTP ${status}` : parseError || `HTTP ${status}`,
    )

    if (ok && route.path === '/api/properties' && Array.isArray(body?.properties) && body.properties[0]?.property_code) {
      const code = body.properties[0].property_code
      const detailPath = `/api/properties/${encodeURIComponent(code)}`
      const detail = await fetchJson(detailPath)
      const detailOk = detail.status >= 200 && detail.status < 400 && !detail.parseError
      record(`GET ${detailPath}`, detailOk, detailOk ? `HTTP ${detail.status}` : detail.parseError || `HTTP ${detail.status}`)
    }

    if (ok && route.path === '/api/articles' && Array.isArray(body?.items) && body.items[0]?.slug) {
      const slug = body.items[0].slug
      const detailPath = `/api/articles/${encodeURIComponent(slug)}`
      const detail = await fetchJson(detailPath)
      const detailOk = detail.status >= 200 && detail.status < 400 && !detail.parseError
      record(`GET ${detailPath}`, detailOk, detailOk ? `HTTP ${detail.status}` : detail.parseError || `HTTP ${detail.status}`)
    }

    if (ok && route.path === '/api/interesting-content' && Array.isArray(body?.items) && body.items[0]?.id) {
      const id = body.items[0].id
      const detailPath = `/api/interesting-content/${encodeURIComponent(id)}`
      const detail = await fetchJson(detailPath)
      const detailOk = detail.status >= 200 && detail.status < 400 && !detail.parseError
      record(`GET ${detailPath}`, detailOk, detailOk ? `HTTP ${detail.status}` : detail.parseError || `HTTP ${detail.status}`)
    }
  }
}

async function testPublicPages(page) {
  console.log('\nPublic pages')
  let samplePropertyCode = null
  let sampleArticleSlug = null

  try {
    const props = await fetchJson('/api/properties')
    samplePropertyCode = props.body?.properties?.[0]?.property_code ?? null
    const articles = await fetchJson('/api/articles')
    sampleArticleSlug = articles.body?.items?.[0]?.slug ?? null
  } catch {
    // dynamic routes skipped below
  }

  const routes = [...PUBLIC_PAGE_ROUTES]
  if (samplePropertyCode) {
    routes.push(`/properties/${encodeURIComponent(samplePropertyCode)}`)
    routes.push(`/en/properties/${encodeURIComponent(samplePropertyCode)}`)
  }
  if (sampleArticleSlug) {
    routes.push(`/articles/${encodeURIComponent(sampleArticleSlug)}`)
    routes.push(`/en/articles/${encodeURIComponent(sampleArticleSlug)}`)
  }

  for (const path of routes) {
    const { ok, detail } = await visitPage(page, path, { expectAdminShell: false })
    record(`PAGE ${path}`, ok, detail)
  }
}

async function visitPage(page, path, { expectAdminShell = false, allowRedirectTo = null } = {}) {
  const errors = []
  const warnings = []

  const onConsole = (msg) => {
    const text = msg.text()
    if (isIgnoredConsoleMessage(text)) return
    if (msg.type() === 'warning') warnings.push(text)
    if (msg.type() === 'error') errors.push(text)
  }

  const onPageError = (error) => {
    errors.push(error.message)
  }

  page.on('console', onConsole)
  page.on('pageerror', onPageError)

  let response = null
  try {
    response = await page.goto(pathOnHost(path), {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    })
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {})
  } catch (error) {
    page.off('console', onConsole)
    page.off('pageerror', onPageError)
    return {
      ok: false,
      detail: error instanceof Error ? error.message : 'navigation failed',
    }
  }

  page.off('console', onConsole)
  page.off('pageerror', onPageError)

  const status = response?.status() ?? 0
  const finalPath = pathnameFromUrl(page.url())

  if (allowRedirectTo && (finalPath === allowRedirectTo.replace(/\/$/, '') || finalPath === allowRedirectTo)) {
    return { ok: true, detail: `redirect → ${finalPath}` }
  }

  if (status >= 400) {
    return { ok: false, detail: `HTTP ${status}` }
  }

  if (expectAdminShell) {
    const adminShell = page.locator('aside').filter({ hasText: 'WP Property' })
    const onLogin = finalPath === '/admin/login'
    if (!onLogin && (await adminShell.count()) === 0) {
      return { ok: false, detail: `ไม่พบ admin layout (อยู่ที่ ${finalPath})` }
    }
  }

  if (errors.length) {
    return { ok: false, detail: `console/page error: ${errors[0]}` }
  }

  if (FAIL_ON_WARNINGS && warnings.length) {
    return { ok: false, detail: `console warning: ${warnings[0]}` }
  }

  return { ok: true, detail: `HTTP ${status || 'ok'}` }
}

async function adminLogin(page) {
  console.log('\nAdmin login')
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    record('admin login', false, 'ตั้ง TEST_EMAIL และ TEST_PASSWORD', true)
    return false
  }

  await page.goto(pathOnHost('/admin/login'), { waitUntil: 'domcontentloaded', timeout: 90_000 })
  await page.waitForSelector('#email', { state: 'visible', timeout: 30_000 })
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  try {
    await Promise.all([
      page.waitForURL((url) => {
        const p = pathnameFromUrl(url.toString())
        return p !== '/admin/login' && (p === '/admin' || p.startsWith('/admin/'))
      }, { timeout: 90_000 }),
      page.click('button[type="submit"]'),
    ])
  } catch {
    const alert = page.locator('[role="alert"]')
    const msg = (await alert.count()) > 0 ? (await alert.first().textContent())?.trim() : 'timeout'
    record('admin login', false, msg || 'login timeout')
    return false
  }

  const finalPath = pathnameFromUrl(page.url())
  if (finalPath === '/admin/login') {
    const alert = page.locator('[role="alert"]')
    const msg = (await alert.count()) > 0 ? (await alert.first().textContent())?.trim() : 'ยังอยู่หน้า login'
    record('admin login', false, msg || 'login failed')
    return false
  }

  const adminShell = page.locator('aside').filter({ hasText: 'WP Property' })
  try {
    await adminShell.first().waitFor({ state: 'visible', timeout: 30_000 })
  } catch {
    record('admin login', false, `login สำเร็จแต่ไม่เห็น admin layout (อยู่ที่ ${finalPath})`)
    return false
  }

  const ok = (await adminShell.count()) > 0
  record('admin login', ok, ok ? `→ ${finalPath}` : 'login สำเร็จแต่ไม่เห็น admin layout')
  return ok
}

async function testAdminPages(page) {
  console.log('\nAdmin pages')
  for (const route of ADMIN_PAGE_ROUTES) {
    const { ok, detail } = await visitPage(page, route.path, {
      expectAdminShell: true,
      allowRedirectTo: route.allowRedirectTo,
    })
    record(`PAGE ${route.path}`, ok, detail)
  }
}

async function testAdminEditPages(page, apiContext) {
  console.log('\nAdmin edit pages (sample)')
  const editPaths = []

  for (const spec of ADMIN_EDIT_DISCOVERY) {
    const { status, body, parseError } = await fetchJson(spec.listPath, { apiContext })
    if (status >= 400 || parseError) {
      record(`DISCOVER ${spec.listPath}`, false, parseError || `HTTP ${status}`)
      continue
    }

    const items = body?.[spec.itemsKey]
    const first = Array.isArray(items) ? items[0] : null
    if (!first?.[spec.idKey]) {
      record(`PAGE edit (${spec.itemsKey})`, true, 'ไม่มีข้อมูล — ข้าม', true)
      continue
    }

    editPaths.push(spec.editPath(first[spec.idKey]))
  }

  for (const path of editPaths) {
    const { ok, detail } = await visitPage(page, path, { expectAdminShell: true })
    record(`PAGE ${path}`, ok, detail)
  }
}

async function testAdminApis(apiContext) {
  console.log('\nAdmin API (authenticated)')

  const unauth = await fetch(pathOnHost('/api/admin/health'))
  record('GET /api/admin/health (guest)', unauth.status === 401, `HTTP ${unauth.status}`)

  for (const route of ADMIN_API_ROUTES) {
    const { status, parseError, body } = await fetchJson(route.path, { apiContext })
    let ok = status >= 200 && status < 400 && !parseError

    if (route.allow403 && status === 403) {
      ok = true
    }

    if (route.checkOk && body && typeof body.ok === 'boolean' && !body.ok) {
      ok = false
    }

    let detail = ok ? `HTTP ${status}` : parseError || `HTTP ${status}`
    if (route.path === '/api/admin/health' && body) {
      detail = `serviceRole=${body.serviceRoleWorks ? 'ok' : 'fail'} role=${body.role ?? '-'}`
      if (body.hint) detail += ` | ${body.hint}`
    }

    record(`GET ${route.path}`, ok, detail)
  }
}

async function testAdminNavLinks(page) {
  console.log('\nAdmin sidebar navigation')
  await page.goto(pathOnHost('/admin'), { waitUntil: 'domcontentloaded', timeout: 90_000 })
  const links = page.locator('aside nav a')
  const count = await links.count()

  for (let i = 0; i < count; i++) {
    const link = links.nth(i)
    const href = await link.getAttribute('href')
    if (!href || !href.startsWith('/admin')) continue

    await link.click()
    await page.waitForLoadState('domcontentloaded')
    await delay(300)

    const finalPath = pathnameFromUrl(page.url())
    const adminShell = page.locator('aside').filter({ hasText: 'WP Property' })
    const onAllowedRedirect = href === '/admin/users' && finalPath === '/admin'
    const ok = (await adminShell.count()) > 0 || onAllowedRedirect
    record(`NAV ${href}`, ok, ok ? `→ ${finalPath}` : 'navigation failed')
  }
}

function printSummary() {
  const failed = results.filter(r => !r.ok && !r.skip)
  const skipped = results.filter(r => r.skip)
  const passed = results.filter(r => r.ok && !r.skip)

  console.log('\n' + '='.repeat(60))
  console.log(`Site test @ ${BASE_URL}`)
  console.log(`Passed: ${passed.length}  Failed: ${failed.length}  Skipped: ${skipped.length}`)
  console.log('='.repeat(60))

  if (failed.length) {
    console.error('\nFailed checks:')
    for (const item of failed) {
      console.error(`  • ${item.name}${item.detail ? ` — ${item.detail}` : ''}`)
    }
  }

  return failed.length === 0
}

async function main() {
  console.log(`\n🔍 Site E2E test → ${BASE_URL}`)

  await testPublicMeta()
  await testNuxtStaticAssets()
  await testPublicApis()
  await testPublicFormPosts()

  const browser = await chromium.launch({ headless: HEADLESS })
  const context = await browser.newContext()
  const page = await context.newPage()

  await testPublicPages(page)
  await browser.close()

  const adminBrowser = await chromium.launch({ headless: HEADLESS })
  const adminContext = await adminBrowser.newContext()
  const adminPage = await adminContext.newPage()

  const loggedIn = await adminLogin(adminPage)
  const apiContext = adminContext.request

  if (loggedIn) {
    await testAdminPages(adminPage)
    await testAdminEditPages(adminPage, apiContext)
    await testAdminApis(apiContext)
    await testAdminPropertyInquiries(apiContext)
    await testAdminArticleCreate(apiContext)
    await testAdminNavLinks(adminPage)
  } else {
    console.log('\nAdmin sections skipped (login failed)')
  }

  await adminBrowser.close()

  const success = printSummary()
  process.exit(success ? 0 : 1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
