import { requireAdmin } from '../../../../utils/require-admin'
import { validatePassword } from '../../../../utils/staff-users'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรหัสผู้ใช้' })
  }

  const body = await readBody(event)
  const password = validatePassword(body?.password)

  if (!password) {
    throw createError({ statusCode: 400, statusMessage: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' })
  }

  const admin = getServiceRoleClient(event)
  const { error } = await admin.auth.admin.updateUserById(id, { password })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { ok: true }
})
