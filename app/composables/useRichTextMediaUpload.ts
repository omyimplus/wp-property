import {
  ADMIN_IMAGE_INPUT_TYPES,
  assertAdminImageWithinLimit,
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
  const entityRef = isRef(entity) ? entity : ref(entity)

  function apiSegment() {
    return entityRef.value === 'articles' ? 'articles' : 'interesting-content'
  }

  async function uploadImage(file: File) {
    const id = itemId.value
    if (!id) throw new Error('บันทึกข้อมูลก่อนอัปโหลดรูป/วิดีโอ')

    const prepared = await prepareAdminImageForUpload(file)
    assertAdminImageWithinLimit(prepared, file.name)

    const form = new FormData()
    form.append('file', prepared, prepared.name)

    return await $fetch<{ storage_path: string, public_url: string }>(
      `/api/admin/${apiSegment()}/${id}/body-media`,
      { method: 'POST', body: form },
    ).then(res => ({
      storagePath: res.storage_path,
      publicUrl: res.public_url,
    }))
  }

  async function uploadVideo(file: File) {
    const id = itemId.value
    if (!id) throw new Error('บันทึกข้อมูลก่อนอัปโหลดรูป/วิดีโอ')

    if (!isAllowedAdminVideoInput(file)) {
      throw new Error('วิดีโอไม่รองรับ (ใช้ MP4 หรือ WebM เท่านั้น)')
    }
    assertAdminVideoWithinLimit(file)

    const form = new FormData()
    form.append('file', file, file.name)

    return await $fetch<{ storage_path: string, public_url: string }>(
      `/api/admin/${apiSegment()}/${id}/body-media`,
      { method: 'POST', body: form },
    ).then(res => ({
      storagePath: res.storage_path,
      publicUrl: res.public_url,
    }))
  }

  async function removeMedia(storagePaths: string[]) {
    const id = itemId.value
    if (!id || !storagePaths.length) return

    await $fetch(`/api/admin/${apiSegment()}/${id}/body-media`, {
      method: 'DELETE',
      body: { storage_paths: storagePaths },
    })
  }

  return {
    uploadImage,
    uploadVideo,
    removeMedia,
    canUpload: computed(() => Boolean(itemId.value)),
  }
}
