#!/usr/bin/env node
/**
 * รัน nuxt build แล้ว fail ถ้ามี ERROR หรือ Duplicated imports
 * ใช้: npm run test:build
 */
import { spawnSync } from 'node:child_process'

const result = spawnSync('npm', ['run', 'build'], {
  encoding: 'utf8',
  shell: process.platform === 'win32',
  env: { ...process.env, NODE_ENV: 'production' },
})

const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`

const duplicated = [...output.matchAll(/Duplicated imports "([^"]+)"/g)].map(m => m[1])
const errors = output
  .split('\n')
  .filter(line => /\bERROR\b/.test(line) && !/Duplicated imports/.test(line))

if (duplicated.length) {
  console.error('\n❌ Duplicated imports:')
  for (const name of [...new Set(duplicated)]) {
    console.error(`  - ${name}`)
  }
}

if (errors.length) {
  console.error('\n❌ Build errors:')
  for (const line of errors) {
    console.error(`  ${line.trim()}`)
  }
}

if (result.status !== 0 && !duplicated.length && !errors.length) {
  console.error('\n❌ Build failed (exit code', result.status, ')')
  console.error(output.slice(-4000))
}

if (duplicated.length || errors.length || result.status !== 0) {
  process.exit(1)
}

console.log('✅ Build passed with no duplicated imports or errors')
