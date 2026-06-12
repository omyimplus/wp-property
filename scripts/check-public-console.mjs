#!/usr/bin/env node
/**
 * เปิดหน้า public แล้วเก็บ console.warn (เหลือง) + console.error (แดง) + page errors
 * ใช้:
 *   npm run test:console:setup   # ครั้งแรก
 *   npm run preview              # อีก terminal (หรือ START_SERVER=1)
 *   npm run test:console
 */
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import { chromium } from 'playwright'
import { PUBLIC_CONSOLE_ROUTES } from './public-routes.mjs'
import { isIgnoredConsoleMessage } from './console-ignore.mjs'

const localBrowsersPath = join(process.cwd(), '.playwright-browsers')
if (!process.env.PLAYWRIGHT_BROWSERS_PATH && existsSync(localBrowsersPath)) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = localBrowsersPath
}

const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '')
const START_SERVER = process.env.START_SERVER === '1'
const FAIL_ON_WARNINGS = process.env.FAIL_ON_WARNINGS !== '0'

/** @type {import('node:child_process').ChildProcess | null} */
let previewProcess = null

async function isServerUp() {
  try {
    const res = await fetch(`${BASE_URL}/`)
    return res.ok
  } catch {
    return false
  }
}

async function waitForServer(timeoutMs = 120_000) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    if (await isServerUp()) return
    await delay(500)
  }
  throw new Error(`Server not ready at ${BASE_URL}`)
}

function startPreviewServer() {
  previewProcess = spawn('npx', ['nuxi', 'preview', '--port', '3000'], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: 'ignore',
  })
}

async function stopPreviewServer() {
  if (!previewProcess) return
  previewProcess.kill('SIGTERM')
  await delay(500)
  previewProcess = null
}

function formatIssue(route, kind, message, location) {
  return {
    route,
    kind,
    message: message.trim(),
    location: location || '',
  }
}

async function checkRoute(page, route) {
  const warnings = []
  const errors = []

  const onConsole = (msg) => {
    const text = msg.text()
    if (isIgnoredConsoleMessage(text)) return

    const location = msg.location()
    const where = location.url
      ? `${location.url}:${location.lineNumber ?? 0}`
      : ''

    if (msg.type() === 'warning') {
      warnings.push(formatIssue(route, 'warning', text, where))
      return
    }

    if (msg.type() === 'error') {
      errors.push(formatIssue(route, 'error', text, where))
    }
  }

  const onPageError = (error) => {
    errors.push(formatIssue(route, 'pageerror', error.message, error.stack?.split('\n')[0] ?? ''))
  }

  page.on('console', onConsole)
  page.on('pageerror', onPageError)

  const response = await page.goto(`${BASE_URL}${route}`, {
    waitUntil: 'networkidle',
    timeout: 60_000,
  })

  if (!response) {
    errors.push(formatIssue(route, 'navigation', 'No response from server', ''))
  } else if (response.status() >= 400) {
    errors.push(formatIssue(route, 'http', `HTTP ${response.status()}`, response.url()))
  }

  page.off('console', onConsole)
  page.off('pageerror', onPageError)

  return { warnings, errors }
}

function printIssues(title, issues) {
  if (!issues.length) return
  console.error(`\n${title} (${issues.length})`)
  for (const issue of issues) {
    console.error(`  [${issue.route}] ${issue.kind}: ${issue.message}`)
    if (issue.location) console.error(`    at ${issue.location}`)
  }
}

async function main() {
  if (!(await isServerUp())) {
    if (!START_SERVER) {
      console.error(`❌ ${BASE_URL} is not reachable.`)
      console.error('   Run `npm run preview` first, or use START_SERVER=1 npm run test:console')
      process.exit(1)
    }

    console.log('Starting preview server…')
    startPreviewServer()
    await waitForServer()
  }

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  const allWarnings = []
  const allErrors = []

  for (const route of PUBLIC_CONSOLE_ROUTES) {
    process.stdout.write(`Checking ${route}… `)
    const { warnings, errors } = await checkRoute(page, route)
    allWarnings.push(...warnings)
    allErrors.push(...errors)
    console.log(errors.length ? 'ERR' : warnings.length ? 'WARN' : 'OK')
  }

  await browser.close()
  await stopPreviewServer()

  printIssues('Console warnings (yellow)', allWarnings)
  printIssues('Console / page errors (red)', allErrors)

  const failWarnings = FAIL_ON_WARNINGS && allWarnings.length > 0
  const failErrors = allErrors.length > 0

  if (failErrors || failWarnings) {
    console.error('\n❌ Console check failed')
    if (failErrors) console.error(`   errors: ${allErrors.length}`)
    if (failWarnings) console.error(`   warnings: ${allWarnings.length}`)
    process.exit(1)
  }

  console.log(`\n✅ Console check passed (${PUBLIC_CONSOLE_ROUTES.length} routes)`)
}

main().catch(async (error) => {
  console.error(error)
  await stopPreviewServer()
  process.exit(1)
})
