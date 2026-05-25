import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import { requireAdmin } from '../../../utils/require-admin'
import { parseStaffRole, validateEmail, validateFullName } from '../../../utils/staff-users'

export default defineEventHandler(async (event) => {
  const { userId: adminId } = await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรหัสผู้ใช้' })
  }

  const body = await readBody(event)
  const updates: Record<string, unknown> = {}

  if (body?.full_name !== undefined) {
    updates.full_name = validateFullName(body.full_name)
  }
  if (body?.role !== undefined) {
    const role = parseStaffRole(body.role)
    if (!role) {
      throw createError({ statusCode: 400, statusMessage: 'บทบาทไม่ถูกต้อง' })
    }
    if (id === adminId && role !== 'admin') {
      throw createError({
        statusCode: 400,
        statusMessage: 'ไม่สามารถเปลี่ยนบทบาทของบัญชีที่กำลังใช้งานอยู่ได้',
      })
    }
    updates.role = role
  }
  if (body?.is_active !== undefined) {
    const isActive = Boolean(body.is_active)
    if (id === adminId && !isActive) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ไม่สามารถระงับบัญชีที่กำลังใช้งานอยู่ได้',
      })
    }
    updates.is_active = isActive
  }

  let newEmail: string | undefined
  if (body?.email !== undefined) {
    const email = validateEmail(body.email)
    if (!email) {
      throw createError({ statusCode: 400, statusMessage: 'อีเมลไม่ถูกต้อง' })
    }
    newEmail = email
    updates.email = email
  }

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่มีข้อมูลที่จะอัปเดต' })
  }

  const client = await serverSupabaseClient(event)
  const { data: profile, error } = await client
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select('id, email, full_name, role, is_active, created_at, updated_at')
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  if (newEmail) {
    const service = serverSupabaseServiceRole(event)
    const { error: authError } = await service.auth.admin.updateUserById(id, {
      email: newEmail,
    })
    if (authError) {
      throw createError({ statusCode: 500, statusMessage: authError.message })
    }
  }

  return { user: profile }
})
