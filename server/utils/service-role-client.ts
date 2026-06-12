import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'

const MISSING_SECRET_MESSAGE =
  'เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า NUXT_SUPABASE_SECRET_KEY (Supabase Secret key ใน Plesk → Node.js → Environment) — การสร้างข้อมูล/อัปโหลดไฟล์ใช้ไม่ได้'

const CONTEXT_KEY = '_wpPropertyServiceRole'

function readSecretFromProcessEnv(): string | undefined {
  const key =
    process.env.NUXT_SUPABASE_SECRET_KEY
    || process.env.SUPABASE_SECRET_KEY
    || process.env.SUPABASE_SERVICE_KEY
    || process.env.SUPABASE_SERVICE_ROLE_KEY

  return key && key.trim().length > 0 ? key.trim() : undefined
}

function readSecretFromRuntimeConfig(event: H3Event): string | undefined {
  const config = useRuntimeConfig(event)
  const supabase = config.supabase as { secretKey?: string; serviceKey?: string } | undefined
  const key = supabase?.secretKey || supabase?.serviceKey
  return key && key.trim().length > 0 ? key.trim() : undefined
}

/** อ่าน secret จาก runtimeConfig (NUXT_ override) หรือ process.env โดยตรง (Plesk) */
export function resolveServiceRoleKey(event?: H3Event): string | undefined {
  if (event) {
    const fromRuntime = readSecretFromRuntimeConfig(event)
    if (fromRuntime) return fromRuntime
  }
  return readSecretFromProcessEnv()
}

export function hasServiceRoleKey(event?: H3Event): boolean {
  return Boolean(resolveServiceRoleKey(event))
}

export function getServiceRoleDiagnostics(event?: H3Event) {
  const processKey = readSecretFromProcessEnv()
  const runtimeKey = event ? readSecretFromRuntimeConfig(event) : undefined
  const resolved = resolveServiceRoleKey(event)

  return {
    processEnvSet: Boolean(processKey),
    processEnvLength: processKey?.length ?? 0,
    runtimeConfigSet: Boolean(runtimeKey),
    runtimeConfigLength: runtimeKey?.length ?? 0,
    resolvedSource: resolved
      ? (runtimeKey ? 'runtimeConfig' : 'process.env')
      : null,
  }
}

export function getServiceRoleClient<T = unknown>(event: H3Event): SupabaseClient<T> {
  const key = resolveServiceRoleKey(event)
  if (!key) {
    throw createError({ statusCode: 503, statusMessage: MISSING_SECRET_MESSAGE })
  }

  const existing = event.context[CONTEXT_KEY] as SupabaseClient<T> | undefined
  if (existing) return existing

  const config = useRuntimeConfig(event)
  const url = config.public.supabase.url
  if (!url) {
    throw createError({ statusCode: 503, statusMessage: 'NUXT_PUBLIC_SUPABASE_URL not configured' })
  }

  const client = createClient<T>(url, key, {
    auth: {
      detectSessionInUrl: false,
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  event.context[CONTEXT_KEY] = client
  return client
}
