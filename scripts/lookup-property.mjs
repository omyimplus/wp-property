#!/usr/bin/env node
/** ค้นหา WP-0060 ใน Supabase */
import 'dotenv/config'
import { loadEnvFile } from './load-env-file.mjs'
import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

loadEnvFile('.env')

const url = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  || process.env.SUPABASE_SERVICE_KEY
  || process.env.NUXT_SUPABASE_SECRET_KEY

if (!url || !key) {
  console.error('ไม่พบ Supabase credentials ใน .env')
  process.exit(1)
}

const code = process.argv[2] || 'WP-0060'
const sb = createClient(url, key, {
  auth: { persistSession: false },
  realtime: { transport: ws },
})

const { data, error } = await sb
  .from('properties')
  .select('id, property_code, latitude, longitude, listing_title')
  .eq('property_code', code)
  .maybeSingle()

if (error) {
  console.error(error.message)
  process.exit(1)
}
if (!data) {
  console.error(`ไม่พบทรัพย์ ${code}`)
  process.exit(1)
}

console.log(JSON.stringify(data, null, 2))
