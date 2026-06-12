import { useAdminImageStorage } from '~/composables/useAdminImageStorage'
import {
  assertAdminImageWithinLimit,
  prepareAdminImageForUpload,
} from '~/utils/admin-image'

export type InterestingContentAssetKind = 'cover' | 'hero'

export function interestingContentAssetPrefix(itemId: string, kind: InterestingContentAssetKind) {
  return `ic/${itemId}/${kind}/`
}

export function useInterestingContentAssetUpload(
  itemId: Ref<string | null>,
  kind: InterestingContentAssetKind,
) {
  const { prepareAndUpload, uploadPreparedFile, buildStoragePath, publicUrl } = useAdminImageStorage()
  const uploading = ref(false)
  const uploadError = ref('')
  const pendingFile = ref<File | null>(null)
  const pendingPreviewUrl = ref<string | null>(null)

  const apiSegment = kind === 'cover' ? 'cover' : 'hero'

  function revokePendingPreview() {
    if (pendingPreviewUrl.value?.startsWith('blob:')) {
      URL.revokeObjectURL(pendingPreviewUrl.value)
    }
    pendingPreviewUrl.value = null
  }

  function clearPending() {
    pendingFile.value = null
    revokePendingPreview()
  }

  async function stageFile(file: File): Promise<string> {
    uploadError.value = ''
    const prepared = await prepareAdminImageForUpload(file)
    assertAdminImageWithinLimit(prepared, file.name)
    clearPending()
    pendingFile.value = prepared
    pendingPreviewUrl.value = URL.createObjectURL(prepared)
    return pendingPreviewUrl.value
  }

  async function uploadToStorage(file: File, id: string): Promise<string> {
    const prefix = interestingContentAssetPrefix(id, kind)
    const { storagePath, publicUrl } = await prepareAndUpload(file, prefix)
    const { item } = await $fetch<{ item: Record<string, string | null> }>(
      `/api/admin/interesting-content/${id}/${apiSegment}`,
      { method: 'POST', body: { storage_path: storagePath } },
    )
    const urlKey = kind === 'cover' ? 'cover_url' : 'hero_url'
    return (item[urlKey] as string | null) ?? publicUrl
  }

  async function uploadPreparedToStorage(prepared: File, id: string): Promise<string> {
    const prefix = interestingContentAssetPrefix(id, kind)
    const storagePath = buildStoragePath(prefix)
    await uploadPreparedFile(prepared, storagePath)
    const { item } = await $fetch<{ item: Record<string, string | null> }>(
      `/api/admin/interesting-content/${id}/${apiSegment}`,
      { method: 'POST', body: { storage_path: storagePath } },
    )
    const urlKey = kind === 'cover' ? 'cover_url' : 'hero_url'
    return (item[urlKey] as string | null) ?? publicUrl(storagePath)
  }

  async function selectFile(file: File): Promise<string | null> {
    uploading.value = true
    uploadError.value = ''
    try {
      const id = itemId.value
      if (id) {
        return await uploadToStorage(file, id)
      }
      return await stageFile(file)
    } catch (e: unknown) {
      uploadError.value = e instanceof Error ? e.message : 'อัปโหลดไม่สำเร็จ'
      return null
    } finally {
      uploading.value = false
    }
  }

  async function flushPending(id: string): Promise<string | null> {
    const prepared = pendingFile.value
    if (!prepared) return null
    uploading.value = true
    uploadError.value = ''
    try {
      const url = await uploadPreparedToStorage(prepared, id)
      clearPending()
      return url
    } catch (e: unknown) {
      uploadError.value = e instanceof Error ? e.message : 'อัปโหลดไม่สำเร็จ'
      return null
    } finally {
      uploading.value = false
    }
  }

  async function removeAsset(): Promise<boolean> {
    uploadError.value = ''
    if (pendingFile.value) {
      clearPending()
      return true
    }
    const id = itemId.value
    if (!id) return false
    try {
      await $fetch(`/api/admin/interesting-content/${id}/${apiSegment}`, { method: 'DELETE' })
      return true
    } catch {
      uploadError.value = 'ลบรูปไม่สำเร็จ'
      return false
    }
  }

  onBeforeUnmount(() => {
    revokePendingPreview()
  })

  return {
    uploading,
    uploadError,
    pendingFile,
    pendingPreviewUrl,
    selectFile,
    flushPending,
    removeAsset,
    clearPending,
  }
}
