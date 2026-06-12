import { useAdminImageStorage } from '~/composables/useAdminImageStorage'
import {
  assertAdminImageWithinLimit,
  prepareAdminImageForUpload,
} from '~/utils/admin-image'
import {
  ADMIN_VIDEO_INPUT_TYPES,
  assertAdminVideoWithinLimit,
  captureVideoPosterFile,
  isAllowedAdminVideoInput,
} from '~/utils/admin-video'

export function reelPosterPrefix(reelId: string) {
  return `reels/${reelId}/poster/`
}

export function reelVideoPrefix(reelId: string) {
  return `reels/${reelId}/video/`
}

export function useReelMediaUpload(reelId: Ref<string | null>) {
  const { uploadPreparedFile, buildStoragePath } = useAdminImageStorage()

  const uploading = ref(false)
  const uploadError = ref('')
  const pendingVideoFile = ref<File | null>(null)
  const pendingPosterFile = ref<File | null>(null)
  const pendingPreviewUrl = ref<string | null>(null)
  const pendingVideoPreviewUrl = ref<string | null>(null)

  function revokePendingPreview() {
    if (pendingPreviewUrl.value?.startsWith('blob:')) {
      URL.revokeObjectURL(pendingPreviewUrl.value)
    }
    pendingPreviewUrl.value = null
    if (pendingVideoPreviewUrl.value?.startsWith('blob:')) {
      URL.revokeObjectURL(pendingVideoPreviewUrl.value)
    }
    pendingVideoPreviewUrl.value = null
  }

  function clearPending() {
    pendingVideoFile.value = null
    pendingPosterFile.value = null
    revokePendingPreview()
  }

  async function stageVideo(file: File): Promise<string> {
    uploadError.value = ''
    assertAdminVideoWithinLimit(file)
    const posterRaw = await captureVideoPosterFile(file)
    const posterPrepared = await prepareAdminImageForUpload(posterRaw)
    assertAdminImageWithinLimit(posterPrepared, posterRaw.name)

    clearPending()
    pendingVideoFile.value = file
    pendingPosterFile.value = posterPrepared
    pendingPreviewUrl.value = URL.createObjectURL(posterPrepared)
    pendingVideoPreviewUrl.value = URL.createObjectURL(file)
    return pendingPreviewUrl.value
  }

  async function uploadVideoFile(file: File, id: string): Promise<void> {
    const formData = new FormData()
    formData.append('file', file, file.name)

    await $fetch(`/api/admin/reels/${id}/video.upload`, {
      method: 'POST',
      body: formData,
    })
  }

  async function uploadPosterFile(prepared: File, id: string): Promise<string> {
    const prefix = reelPosterPrefix(id)
    const storagePath = buildStoragePath(prefix)
    await uploadPreparedFile(prepared, storagePath)
    const { item } = await $fetch<{ item: { poster_url: string | null } }>(
      `/api/admin/reels/${id}/poster`,
      { method: 'POST', body: { storage_path: storagePath } },
    )
    return item.poster_url ?? storagePath
  }

  async function uploadToStorage(file: File, id: string): Promise<{ posterUrl: string, videoUrl: string | null }> {
    const posterRaw = await captureVideoPosterFile(file)
    const posterPrepared = await prepareAdminImageForUpload(posterRaw)
    assertAdminImageWithinLimit(posterPrepared, posterRaw.name)

    await uploadVideoFile(file, id)
    const posterUrl = await uploadPosterFile(posterPrepared, id)

    const { item } = await $fetch<{ item: { video_url: string | null } }>(`/api/admin/reels/${id}`)
    return { posterUrl, videoUrl: item.video_url }
  }

  async function selectFile(file: File): Promise<string | null> {
    uploading.value = true
    uploadError.value = ''
    try {
      const id = reelId.value
      if (id) {
        const result = await uploadToStorage(file, id)
        return result.posterUrl
      }
      return await stageVideo(file)
    } catch (e: unknown) {
      uploadError.value = e instanceof Error ? e.message : 'อัปโหลดไม่สำเร็จ'
      return null
    } finally {
      uploading.value = false
    }
  }

  async function flushPending(id: string): Promise<{ posterUrl: string | null, videoUrl: string | null }> {
    const video = pendingVideoFile.value
    const poster = pendingPosterFile.value
    if (!video || !poster) {
      return { posterUrl: null, videoUrl: null }
    }

    uploading.value = true
    uploadError.value = ''
    try {
      await uploadVideoFile(video, id)
      const posterUrl = await uploadPosterFile(poster, id)
      const { item } = await $fetch<{ item: { video_url: string | null } }>(`/api/admin/reels/${id}`)
      clearPending()
      return { posterUrl, videoUrl: item.video_url }
    } catch (e: unknown) {
      uploadError.value = e instanceof Error ? e.message : 'อัปโหลดไม่สำเร็จ'
      return { posterUrl: null, videoUrl: null }
    } finally {
      uploading.value = false
    }
  }

  async function removeMedia(): Promise<boolean> {
    uploadError.value = ''
    if (pendingVideoFile.value) {
      clearPending()
      return true
    }

    const id = reelId.value
    if (!id) return false

    try {
      await $fetch(`/api/admin/reels/${id}/video`, { method: 'DELETE' })
      await $fetch(`/api/admin/reels/${id}/poster`, { method: 'DELETE' })
      return true
    } catch {
      uploadError.value = 'ลบวิดีโอไม่สำเร็จ'
      return false
    }
  }

  onBeforeUnmount(() => {
    revokePendingPreview()
  })

  return {
    uploading,
    uploadError,
    pendingVideoFile,
    pendingPreviewUrl,
    pendingVideoPreviewUrl,
    selectFile,
    flushPending,
    removeMedia,
    clearPending,
    videoAccept: ADMIN_VIDEO_INPUT_TYPES.join(','),
    isAllowedAdminVideoInput,
  }
}
