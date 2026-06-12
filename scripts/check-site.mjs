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
  await page.fill('#email', TEST_EMAIL)
  await page.fill('#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')

  try {
    await page.waitForURL((url) => {
      const p = pathnameFromUrl(url.toString())
      return p !== '/admin/login' && (p === '/admin' || p.startsWith('/admin/'))
    }, { timeout: 45_000 })
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
  await testPublicApis()

  const browser = await chromium.launch({ headless: HEADLESS })
  const context = await browser.newContext()
  const page = await context.newPage()

  await testPublicPages(page)

  const loggedIn = await adminLogin(page)
  const apiContext = context.request

  if (loggedIn) {
    await testAdminPages(page)
    await testAdminEditPages(page, apiContext)
    await testAdminApis(apiContext)
    await testAdminNavLinks(page)
  } else {
    console.log('\nAdmin sections skipped (login failed)')
  }

  await browser.close()

  const success = printSummary()
  process.exit(success ? 0 : 1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
