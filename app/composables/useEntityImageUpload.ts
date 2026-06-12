import type { PropertyImage } from '~/types/property'
import type { PropertyCustomerImage } from '~/types/property-customer'
import { useAdminImageStorage } from '~/composables/useAdminImageStorage'

export type EntityImage = PropertyImage | PropertyCustomerImage

export function useEntityImageUpload(options: {
  entityId: Ref<string | null>
  apiBase: string
  pathPrefix: (id: string) => string
}) {
  const { prepareAndUpload, publicUrl } = useAdminImageStorage()
  const uploading = ref(false)
  const uploadError = ref('')

  async function uploadFiles(files: File[], startOrder = 0): Promise<EntityImage[]> {
    const id = options.entityId.value
    if (!id) {
      uploadError.value = 'บันทึกข้อมูลก่อนอัปโหลดรูป'
      return []
    }

    uploading.value = true
    uploadError.value = ''
    const results: EntityImage[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const { storagePath } = await prepareAndUpload(files[i], options.pathPrefix(id))

        const { image } = await $fetch<{ image: EntityImage }>(
          `${options.apiBase}/${id}/images`,
          {
            method: 'POST',
            body: { storage_path: storagePath, sort_order: startOrder + i },
          },
        )

        results.push({ ...image, public_url: publicUrl(image.storage_path) })
      }
    } catch (e: unknown) {
      uploadError.value = e instanceof Error ? e.message : 'อัปโหลดไม่สำเร็จ'
    } finally {
      uploading.value = false
    }

    return results
  }

  async function removeImage(image: EntityImage) {
    const id = options.entityId.value
    if (!id) return false

    try {
      await $fetch(`${options.apiBase}/${id}/images/${image.id}`, { method: 'DELETE' })
      return true
    } catch {
      uploadError.value = 'ลบรูปไม่สำเร็จ'
      return false
    }
  }

  return {
    uploading,
    uploadError,
    uploadFiles,
    removeImage,
    publicUrl,
  }
}

export function usePropertyImageUpload(propertyId: Ref<string | null>) {
  return useEntityImageUpload({
    entityId: propertyId,
    apiBase: '/api/admin/properties',
    pathPrefix: id => `${id}/`,
  })
}

export function useConsignmentImageUpload(consignmentId: Ref<string | null>) {
  return useEntityImageUpload({
    entityId: consignmentId,
    apiBase: '/api/admin/consignments',
    pathPrefix: id => `pc/${id}/`,
  })
}

export function useInterestingContentCoverUpload(itemId: Ref<string | null>) {
  const { prepareAndUpload } = useAdminImageStorage()
  const uploading = ref(false)
  const uploadError = ref('')

  async function uploadCover(file: File): Promise<string | null> {
    const id = itemId.value
    if (!id) {
      uploadError.value = 'บันทึกข้อมูลก่อนอัปโหลดรูป'
      return null
    }

    uploading.value = true
    uploadError.value = ''

    try {
      const { storagePath, publicUrl: url } = await prepareAndUpload(file, `ic/${id}/cover/`)
      const { item } = await $fetch<{ item: { cover_url: string | null } }>(
        `/api/admin/interesting-content/${id}/cover`,
        { method: 'POST', body: { storage_path: storagePath } },
      )
      return item.cover_url ?? url
    } catch (e: unknown) {
      uploadError.value = e instanceof Error ? e.message : 'อัปโหลดไม่สำเร็จ'
      return null
    } finally {
      uploading.value = false
    }
  }

  async function removeCover(): Promise<boolean> {
    const id = itemId.value
    if (!id) return false
    try {
      await $fetch(`/api/admin/interesting-content/${id}/cover`, { method: 'DELETE' })
      return true
    } catch {
      uploadError.value = 'ลบรูปไม่สำเร็จ'
      return false
    }
  }

  return { uploading, uploadError, uploadCover, removeCover }
}
