import type { PropertyImage } from '~/types/property'
import type { PropertyCustomerImage } from '~/types/property-customer'
import {
  PROPERTY_IMAGE_MIME,
  preparePropertyImageForUpload,
} from '~/utils/prepare-property-image'

export type EntityImage = PropertyImage | PropertyCustomerImage

const BUCKET = 'property-images'
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

export function useEntityImageUpload(options: {
  entityId: Ref<string | null>
  apiBase: string
  pathPrefix: (id: string) => string
}) {
  const supabase = useSupabaseClient()
  const uploading = ref(false)
  const uploadError = ref('')

  function publicUrl(path: string) {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return data.publicUrl
  }

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
        const prepared = await preparePropertyImageForUpload(files[i])
        if (prepared.size > MAX_UPLOAD_BYTES) {
          throw new Error(
            `รูป ${files[i].name} ยังใหญ่เกินไปหลังปรับขนาด — ลองใช้รูปที่เล็กลง`,
          )
        }

        const storage_path = `${options.pathPrefix(id)}${crypto.randomUUID()}.webp`

        const { error: storageError } = await supabase.storage
          .from(BUCKET)
          .upload(storage_path, prepared, {
            upsert: false,
            cacheControl: '3600',
            contentType: PROPERTY_IMAGE_MIME,
          })

        if (storageError) {
          throw new Error(storageError.message)
        }

        const { image } = await $fetch<{ image: EntityImage }>(
          `${options.apiBase}/${id}/images`,
          {
            method: 'POST',
            body: { storage_path, sort_order: startOrder + i },
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
