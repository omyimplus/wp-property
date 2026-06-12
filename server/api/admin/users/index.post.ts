import { getServiceRoleClient } from '../../../utils/service-role-client'
import { requireAdmin } from '../../../utils/require-admin'
import {
  parseStaffRole,
  validateEmail,
  validateFullName,
  validatePassword,
} from '../../../utils/staff-users'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  const email = validateEmail(body?.email)
  const password = validatePassword(body?.password)
  const role = parseStaffRole(body?.role) ?? 'employee'
  const fullName = validateFullName(body?.full_name)
  const isActive = body?.is_active !== false

  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'อีเมลไม่ถูกต้อง' })
  }
  if (!password) {
    throw createError({ statusCode: 400, statusMessage: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' })
  }

  const admin = getServiceRoleClient(event)

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    const msg = authError.message.includes('already been registered')
      ? 'อีเมลนี้ถูกใช้งานแล้ว'
      : authError.message
    throw createError({ statusCode: 400, statusMessage: msg })
  }

  const userId = authData.user?.id
  if (!userId) {
    throw createError({ statusCode: 500, statusMessage: 'สร้างผู้ใช้ไม่สำเร็จ' })
  }

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .insert({
      id: userId,
      email,
      full_name: fullName,
      role,
      is_active: isActive,
    })
    .select('id, email, full_name, role, is_active, created_at, updated_at')
    .single()

  if (profileError) {
    await admin.auth.admin.deleteUser(userId)
    throw createError({ statusCode: 500, statusMessage: profileError.message })
  }

  return { user: profile }
})
