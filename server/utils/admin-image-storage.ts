/** ตรวจ path รูป WebP ใน bucket property-images (ฝั่ง server) */

export const ADMIN_IMAGE_BUCKET = 'property-images'

export function validateAdminWebpStoragePath(
  storagePath: string,
  requiredPrefix: string,
): boolean {
  if (!storagePath || storagePath.includes('..')) return false
  if (!storagePath.endsWith('.webp')) return false
  const prefix = requiredPrefix.endsWith('/') ? requiredPrefix : `${requiredPrefix}/`
  return storagePath.startsWith(prefix)
}

export function assertAdminWebpStoragePath(
  storagePath: string,
  requiredPrefix: string,
  message = 'path รูปไม่ถูกต้อง (ต้องเป็น .webp และอยู่ใต้โฟลเดอร์ที่กำหนด)',
) {
  if (!validateAdminWebpStoragePath(storagePath, requiredPrefix)) {
    throw createError({ statusCode: 400, statusMessage: message })
  }
}
