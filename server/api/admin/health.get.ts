import { requireStaff } from '../../utils/require-staff'
import {
  getServiceRoleClient,
  getServiceRoleDiagnostics,
  hasServiceRoleKey,
} from '../../utils/service-role-client'

export default defineEventHandler(async (event) => {
  const { userId, profile } = await requireStaff(event)
  const diagnostics = getServiceRoleDiagnostics(event)

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
  const configured = hasServiceRoleKey(event)

  return {
    ok: serviceRoleOk,
    session: true,
    userId,
    role: profile.role,
    supabaseUrl: Boolean(config.public.supabase?.url),
    serviceRoleConfigured: configured,
    serviceRoleWorks: serviceRoleOk,
    diagnostics,
    hint: !configured
      ? diagnostics.processEnvSet
        ? 'process.env มีค่า แต่ runtime ยังไม่อ่าน — ลอง Restart App หรือใส่ใน httpdocs/.output/.env แล้ว Restart'
        : 'เพิ่ม NUXT_SUPABASE_SECRET_KEY ใน Plesk → Node.js → Custom environment variables (รูปแบบ KEY=value ไม่มีช่องว่างรอบ =) แล้ว Restart App'
      : !serviceRoleOk
        ? 'Secret key อาจผิด — ใช้ Secret key จาก Supabase Dashboard (ไม่ใช่ publishable/anon key)'
        : null,
    error: serviceRoleError,
  }
})
