import {
  ADMIN_IMAGE_BUCKET,
  ADMIN_IMAGE_MIME,
  assertAdminImageWithinLimit,
  buildAdminWebpStoragePath,
  prepareAdminImageForUpload,
} from '~/utils/admin-image'

/**
 * ฟังก์ชันกลางอัปโหลดรูปหลังบ้าน:
 * 1. ปรับขนาด + แปลง WebP (client)
 * 2. อัปโหลด Supabase Storage bucket property-images
 */
export function useAdminImageStorage() {
  const supabase = useSupabaseClient()

  function publicUrl(storagePath: string) {
    const { data } = supabase.storage.from(ADMIN_IMAGE_BUCKET).getPublicUrl(storagePath)
    return data.publicUrl
  }

  async function prepareFile(file: File): Promise<File> {
    const prepared = await prepareAdminImageForUpload(file)
    assertAdminImageWithinLimit(prepared, file.name)
    return prepared
  }

  async function uploadPreparedFile(prepared: File, storagePath: string) {
    const { error } = await supabase.storage.from(ADMIN_IMAGE_BUCKET).upload(storagePath, prepared, {
      upsert: false,
      cacheControl: '3600',
      contentType: ADMIN_IMAGE_MIME,
    })
    if (error) {
      throw new Error(error.message)
    }
  }

  /** ปรับขนาด → WebP → อัปโหลด storage */
  async function prepareAndUpload(file: File, pathPrefix: string) {
    const prepared = await prepareFile(file)
    const storagePath = buildAdminWebpStoragePath(pathPrefix)
    await uploadPreparedFile(prepared, storagePath)
    return { prepared, storagePath, publicUrl: publicUrl(storagePath) }
  }

  return {
    publicUrl,
    prepareFile,
    uploadPreparedFile,
    prepareAndUpload,
    buildStoragePath: buildAdminWebpStoragePath,
  }
}
