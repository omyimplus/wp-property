<script setup lang="ts">
import type { EntityImage } from '~/composables/useEntityImageUpload'
import {
  isAllowedAdminImageInput,
  ADMIN_IMAGE_INPUT_TYPES,
  ADMIN_IMAGE_MAX_WIDTH,
} from '~/utils/admin-image'

const props = defineProps<{
  entityId: string | null
  images: EntityImage[]
  disabled?: boolean
  allowPendingBeforeSave?: boolean
  apiBase: string
  storagePathPrefix: (id: string) => string
}>()

const emit = defineEmits<{
  'update:images': [EntityImage[]]
}>()

const entityIdRef = toRef(() => props.entityId)
const { uploading, uploadError, uploadFiles, removeImage } = useEntityImageUpload({
  entityId: entityIdRef,
  apiBase: props.apiBase,
  pathPrefix: props.storagePathPrefix,
})

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const pendingFiles = ref<File[]>([])
const pendingPreviews = ref<string[]>([])

const acceptAttr = ADMIN_IMAGE_INPUT_TYPES.join(',')

const canPickFiles = computed(
  () => !props.disabled && (Boolean(props.entityId) || props.allowPendingBeforeSave),
)

const statusMessage = computed(() => {
  if (props.entityId) return null
  if (props.allowPendingBeforeSave) {
    if (pendingFiles.value.length) {
      return `เลือกรูปแล้ว ${pendingFiles.value.length} ไฟล์ — กด「บันทึกข้อมูล」ด้านล่างเพื่ออัปโหลด`
    }
    return 'เลือกรูปได้เลย — จะอัปโหลดอัตโนมัติหลังกดบันทึกข้อมูลด้านล่าง'
  }
  return 'บันทึกข้อมูลทรัพย์ก่อน แล้วค่อยอัปโหลดรูป'
})

function revokePreviews() {
  for (const url of pendingPreviews.value) URL.revokeObjectURL(url)
  pendingPreviews.value = []
}

function setPending(files: File[]) {
  revokePreviews()
  pendingFiles.value = files
  pendingPreviews.value = files.map(f => URL.createObjectURL(f))
}

function onFiles(fileList: FileList | File[]) {
  if (!canPickFiles.value) return

  const incoming = Array.from(fileList).filter(isAllowedAdminImageInput)
  if (!incoming.length) {
    uploadError.value = 'ไฟล์ไม่รองรับ — ใช้ JPG, PNG, WebP หรือ GIF'
    return
  }

  if (props.entityId) {
    uploadFiles(incoming, (props.images ?? []).length).then((added) => {
      if (added.length) emit('update:images', [...(props.images ?? []), ...added])
    })
    return
  }

  if (props.allowPendingBeforeSave) {
    setPending([...pendingFiles.value, ...incoming])
    uploadError.value = ''
  }
}

function removePendingAt(index: number) {
  const next = pendingFiles.value.filter((_, i) => i !== index)
  setPending(next)
}

async function flushPendingUploads() {
  if (!props.entityId || !pendingFiles.value.length) return
  const files = [...pendingFiles.value]
  setPending([])
  const added = await uploadFiles(files, (props.images ?? []).length)
  if (added.length) emit('update:images', [...(props.images ?? []), ...added])
}

watch(
  () => props.entityId,
  (id, prev) => {
    if (id && id !== prev) flushPendingUploads()
  },
)

onBeforeUnmount(revokePreviews)

function onDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files) onFiles(e.dataTransfer.files)
}

async function onRemove(img: EntityImage) {
  if (!confirm('ลบรูปนี้?')) return
  const ok = await removeImage(img)
  if (ok) emit('update:images', (props.images ?? []).filter(i => i.id !== img.id))
}

function imageSrc(img: EntityImage) {
  return img.public_url ?? ''
}

defineExpose({ flushPendingUploads })
</script>

<template>
  <div class="space-y-3">
    <div
      class="relative rounded-xl border-2 border-dashed p-8 text-center transition"
      :class="[
        isDragging ? 'border-amber-500 bg-amber-50' : 'border-slate-300 bg-slate-50',
        canPickFiles ? 'cursor-pointer hover:border-amber-400' : 'cursor-not-allowed opacity-60',
      ]"
      @dragover.prevent="canPickFiles && (isDragging = true)"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
      @click="canPickFiles && fileInput?.click()"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="acceptAttr"
        multiple
        class="hidden"
        :disabled="!canPickFiles"
        @change="(e) => onFiles((e.target as HTMLInputElement).files ?? [])"
      >
      <p class="text-sm font-medium text-slate-700">
        ลากรูปมาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
      </p>
      <p class="mt-1 text-xs text-slate-500">
        JPG, PNG, WebP, GIF · ปรับขนาดกว้างไม่เกิน {{ ADMIN_IMAGE_MAX_WIDTH }}px แล้วเป็น WebP
      </p>
      <p
        v-if="statusMessage"
        class="mt-2 text-xs"
        :class="entityId ? 'text-slate-500' : 'text-amber-800'"
      >
        {{ statusMessage }}
      </p>
      <p v-if="uploading" class="mt-2 text-xs text-slate-600">กำลังปรับขนาดและอัปโหลด...</p>
    </div>

    <p v-if="uploadError" class="text-sm text-red-600">{{ uploadError }}</p>

    <div v-if="pendingPreviews.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      <div
        v-for="(url, idx) in pendingPreviews"
        :key="url"
        class="relative aspect-square overflow-hidden rounded-lg border border-amber-200 bg-amber-50"
      >
        <img :src="url" :alt="`รออัปโหลด ${idx + 1}`" class="h-full w-full object-cover opacity-90">
        <span class="absolute bottom-1 left-1 rounded bg-amber-600/90 px-1.5 text-xs text-white">
          รอบันทึก
        </span>
        <button
          type="button"
          class="absolute right-1 top-1 rounded bg-red-600/90 px-2 py-0.5 text-xs text-white"
          @click.stop="removePendingAt(idx)"
        >
          ลบ
        </button>
      </div>
    </div>

    <div v-if="(images ?? []).length" class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      <div
        v-for="(img, idx) in images"
        :key="img.id"
        class="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-white"
      >
        <img
          :src="imageSrc(img)"
          :alt="`รูปที่ ${idx + 1}`"
          class="h-full w-full object-cover"
        >
        <button
          type="button"
          class="absolute right-1 top-1 rounded bg-red-600/90 px-2 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100"
          :disabled="disabled"
          @click.stop="onRemove(img)"
        >
          ลบ
        </button>
        <span class="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 text-xs text-white">
          {{ idx + 1 }}
        </span>
      </div>
    </div>
  </div>
</template>
