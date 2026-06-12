import { serverSupabaseServiceRole } from '#supabase/server'
import { requireStaff } from '../../../../utils/require-staff'
import {
  assertBodyMediaStoragePath,
  removeStoragePaths,
} from '../../../../utils/rich-text-media'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const body = await readBody(event)
  const raw = Array.isArray(body?.storage_paths) ? body.storage_paths : []
  const storage_paths = raw.filter((p): p is string => typeof p === 'string' && p.trim()).map(p => p.trim())

  if (!storage_paths.length) {
    return { ok: true, removed: 0 }
  }

  for (const path of storage_paths) {
    assertBodyMediaStoragePath(id, path, 'path สื่อไม่ถูกต้อง', 'articles')
  }

  const service = serverSupabaseServiceRole(event)
  await removeStoragePaths(service, storage_paths)

  return { ok: true, removed: storage_paths.length }
})
