import {
  ADMIN_IMAGE_BUCKET,
  ADMIN_IMAGE_MIME,
  assertAdminImageWithinLimit,
  buildAdminWebpStoragePath,
  prepareAdminImageForUpload,
} from '~/utils/admin-image'
import {
  adminVideoExtension,
  assertAdminVideoWithinLimit,
  isAllowedAdminVideoInput,
} from '~/utils/admin-video'

export type RichTextMediaEntity = 'ic' | 'articles'

export function useRichTextMediaUpload(
  itemId: Ref<string | null>,
  entity: Ref<RichTextMediaEntity> | RichTextMediaEntity = 'ic',
) {
  const supabase = useSupabaseClient()
  const entityRef = isRef(entity) ? entity : ref(entity)

  const pathPrefix = computed(() => {
    const id = itemId.value
    if (!id) return null
    return entityRef.value === 'articles' ? `articles/${id}/body/` : `ic/${id}/body/`
  })

  function publicUrl(storagePath: string) {
    const { data } = supabase.storage.from(ADMIN_IMAGE_BUCKET).getPublicUrl(storagePath)
    return data.publicUrl
  }

  async function uploadImage(file: File) {
    const prefix = pathPrefix.value
    if (!prefix) throw new Error('บันทึกข้อมูลก่อนอัปโหลดรูป/วิดีโอ')

    const prepared = await prepareAdminImageForUpload(file)
    assertAdminImageWithinLimit(prepared, file.name)
    const storagePath = buildAdminWebpStoragePath(prefix)

    const { error } = await supabase.storage.from(ADMIN_IMAGE_BUCKET).upload(storagePath, prepared, {
      upsert: false,
      cacheControl: '3600',
      contentType: ADMIN_IMAGE_MIME,
    })
    if (error) throw new Error(error.message)

    return { storagePath, publicUrl: publicUrl(storagePath) }
  }

  async function uploadVideo(file: File) {
    const prefix = pathPrefix.value
    if (!prefix) throw new Error('บันทึกข้อมูลก่อนอัปโหลดรูป/วิดีโอ')

    assertAdminVideoWithinLimit(file)
    const ext = adminVideoExtension(file.type)
    const storagePath = `${prefix}${crypto.randomUUID()}.${ext}`

    const { error } = await supabase.storage.from(ADMIN_IMAGE_BUCKET).upload(storagePath, file, {
      upsert: false,
      cacheControl: '3600',
      contentType: file.type,
    })
    if (error) throw new Error(error.message)

    return { storagePath, publicUrl: publicUrl(storagePath) }
  }

  async function removeMedia(storagePaths: string[]) {
    const id = itemId.value
    if (!id || !storagePaths.length) return

    const apiSegment = entityRef.value === 'articles' ? 'articles' : 'interesting-content'
    await $fetch(`/api/admin/${apiSegment}/${id}/body-media`, {
      method: 'DELETE',
      body: { storage_paths: storagePaths },
    })
  }

  return {
    uploadImage,
    uploadVideo,
    removeMedia,
    canUpload: computed(() => Boolean(pathPrefix.value)),
  }
}
