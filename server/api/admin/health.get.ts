import { requireStaff } from '../../utils/require-staff'
import { getServiceRoleClient, hasServiceRoleKey } from '../../utils/service-role-client'

export default defineEventHandler(async (event) => {
  const { userId, profile } = await requireStaff(event)

  let serviceRoleOk = false
  let serviceRoleError: string | null = null

  if (hasServiceRoleKey(event)) {
    try {
      const client = getServiceRoleClient(event)
      const { error } = await client.from('profiles').select('id').limit(1)
      serviceRoleOk = !error
      serviceRoleError = error?.message ?? null
    } catch (error) {
      serviceRoleError = error instanceof Error ? error.message : 'unknown error'
    }
  } else {
    serviceRoleError = 'NUXT_SUPABASE_SECRET_KEY not configured'
  }

  const config = useRuntimeConfig(event)

  return {
    ok: serviceRoleOk,
    session: true,
    userId,
    role: profile.role,
    supabaseUrl: Boolean(config.public.supabase?.url),
    serviceRoleConfigured: hasServiceRoleKey(event),
    serviceRoleWorks: serviceRoleOk,
    hint: !hasServiceRoleKey(event)
      ? 'เพิ่ม NUXT_SUPABASE_SECRET_KEY ใน Plesk → Node.js → Custom environment variables แล้ว Restart App'
      : !serviceRoleOk
        ? 'Secret key อาจผิด — ใช้ Secret key จาก Supabase Dashboard (ไม่ใช่ publishable/anon key)'
        : null,
    error: serviceRoleError,
  }
})
