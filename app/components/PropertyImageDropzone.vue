<script setup lang="ts">
import type { EntityImage } from '~/composables/useEntityImageUpload'
import {
  isAllowedAdminImageInput,
  ADMIN_IMAGE_INPUT_TYPES,
  ADMIN_IMAGE_MAX_WIDTH,
} from '~/utils/admin-image'

const REORDER_MIME = 'application/x-wp-image-reorder'

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
const { uploading, uploadError, uploadFiles, removeImage, reorderImages } = useEntityImageUpload({
  entityId: entityIdRef,
  apiBase: props.apiBase,
  pathPrefix: props.storagePathPrefix,
})

const isFileDragging = ref(false)
const reordering = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const pendingFiles = ref<File[]>([])
const pendingPreviews = ref<string[]>([])

const dragFromIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)
const dragKind = ref<'saved' | 'pending' | null>(null)

const acceptAttr = ADMIN_IMAGE_INPUT_TYPES.join(',')

const canPickFiles = computed(
  () => !props.disabled && (Boolean(props.entityId) || props.allowPendingBeforeSave),
)

const canReorder = computed(() => !props.disabled && !reordering.value)

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

function reorderPending(from: number, to: number) {
  if (from === to) return
  const files = [...pendingFiles.value]
  const [file] = files.splice(from, 1)
  files.splice(to, 0, file)
  setPending(files)
}

const sortedImages = computed(() =>
  [...(props.images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
)

function withSortOrder(images: EntityImage[]) {
  return images.map((img, index) => ({ ...img, sort_order: index }))
}

async function applyImageOrder(next: EntityImage[]) {
  if (!props.entityId) {
    emit('update:images', next)
    return
  }

  reordering.value = true
  const ok = await reorderImages(next.map(img => img.id))
  reordering.value = false
  if (ok) emit('update:images', next)
}

async function reorderImageTo(from: number, to: number) {
  if (!canReorder.value || from === to) return

  const list = [...sortedImages.value]
  const [item] = list.splice(from, 1)
  list.splice(to, 0, item)
  await applyImageOrder(withSortOrder(list))
}

async function moveImage(index: number, direction: -1 | 1) {
  await reorderImageTo(index, index + direction)
}

function resetDragState() {
  dragFromIndex.value = null
  dragOverIndex.value = null
  dragKind.value = null
}

function isReorderDrag(e: DragEvent) {
  return e.dataTransfer?.types.includes(REORDER_MIME) ?? false
}

function onReorderDragStart(e: DragEvent, index: number, kind: 'saved' | 'pending') {
  if (!canReorder.value) {
    e.preventDefault()
    return
  }

  dragFromIndex.value = index
  dragOverIndex.value = index
  dragKind.value = kind
  e.dataTransfer!.effectAllowed = 'move'
  e.dataTransfer!.setData('text/plain', String(index))
  e.dataTransfer!.setData(REORDER_MIME, kind)
}

function onReorderDragOver(e: DragEvent, index: number, kind: 'saved' | 'pending') {
  if (!isReorderDrag(e) || dragKind.value !== kind || dragFromIndex.value === null) return
  e.preventDefault()
  e.dataTransfer!.dropEffect = 'move'
  dragOverIndex.value = index
}

function onReorderDrop(e: DragEvent, toIndex: number, kind: 'saved' | 'pending') {
  if (!isReorderDrag(e)) return
  e.preventDefault()
  e.stopPropagation()

  const from = dragFromIndex.value
  if (from === null || dragKind.value !== kind) {
    resetDragState()
    return
  }

  if (kind === 'pending') reorderPending(from, toIndex)
  else void reorderImageTo(from, toIndex)

  resetDragState()
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

function onFileDrop(e: DragEvent) {
  isFileDragging.value = false
  if (isReorderDrag(e)) return
  if (e.dataTransfer?.files?.length) onFiles(e.dataTransfer.files)
}

async function onRemove(img: EntityImage) {
  if (!confirm('ลบรูปนี้?')) return
  const ok = await removeImage(img)
  if (ok) emit('update:images', (props.images ?? []).filter(i => i.id !== img.id))
}

function imageSrc(img: EntityImage) {
  return img.public_url ?? ''
}

function tileClass(index: number, kind: 'saved' | 'pending', extra = '') {
  const dragging = dragKind.value === kind && dragFromIndex.value === index
  const over = dragKind.value === kind && dragOverIndex.value === index && dragFromIndex.value !== index
  return [
    extra,
    canReorder.value ? 'cursor-grab active:cursor-grabbing' : '',
    dragging ? 'scale-[0.97] opacity-60 ring-2 ring-amber-400' : '',
    over ? 'ring-2 ring-wp-navy ring-offset-1' : '',
  ]
}

defineExpose({ flushPendingUploads })
</script>

<template>
  <div class="space-y-3">
    <div
      class="relative rounded-xl border-2 border-dashed p-8 text-center transition"
      :class="[
        isFileDragging ? 'border-amber-500 bg-amber-50' : 'border-slate-300 bg-slate-50',
        canPickFiles ? 'cursor-pointer hover:border-amber-400' : 'cursor-not-allowed opacity-60',
      ]"
      @dragover.prevent="canPickFiles && (isFileDragging = true)"
      @dragleave.prevent="isFileDragging = false"
      @drop.prevent="onFileDrop"
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

    <div v-if="pendingPreviews.length" class="space-y-2">
      <p class="text-xs text-slate-500">
        คลิกค้างแล้วลากเพื่อจัดลำดับ หรือใช้ปุ่ม ← → (รูปแรกจะแสดงเป็นปก)
      </p>
      <div class="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        <div
          v-for="(url, idx) in pendingPreviews"
          :key="url"
          draggable="true"
          class="relative aspect-square overflow-hidden rounded-lg border border-amber-200 bg-amber-50 transition"
          :class="tileClass(idx, 'pending')"
          @dragstart="onReorderDragStart($event, idx, 'pending')"
          @dragover="onReorderDragOver($event, idx, 'pending')"
          @drop="onReorderDrop($event, idx, 'pending')"
          @dragend="resetDragState"
        >
          <img
            :src="url"
            :alt="`รออัปโหลด ${idx + 1}`"
            draggable="false"
            class="pointer-events-none h-full w-full object-cover opacity-90"
          >
          <span class="absolute bottom-1 left-1 rounded bg-amber-600/90 px-1.5 text-xs text-white">
            รอบันทึก · {{ idx + 1 }}
          </span>
          <div class="absolute left-1 top-1 flex gap-0.5">
            <button
              type="button"
              class="rounded bg-white/90 px-1.5 py-0.5 text-xs text-slate-700 shadow disabled:opacity-40"
              :disabled="idx === 0"
              title="เลื่อนไปซ้าย"
              @click.stop="reorderPending(idx, idx - 1)"
            >
              ←
            </button>
            <button
              type="button"
              class="rounded bg-white/90 px-1.5 py-0.5 text-xs text-slate-700 shadow disabled:opacity-40"
              :disabled="idx === pendingPreviews.length - 1"
              title="เลื่อนไปขวา"
              @click.stop="reorderPending(idx, idx + 1)"
            >
              →
            </button>
          </div>
          <button
            type="button"
            class="absolute right-1 top-1 rounded bg-red-600/90 px-2 py-0.5 text-xs text-white"
            @click.stop="removePendingAt(idx)"
          >
            ลบ
          </button>
        </div>
      </div>
    </div>

    <div v-if="sortedImages.length" class="space-y-2">
      <p class="text-xs text-slate-500">
        คลิกค้างแล้วลากเพื่อจัดลำดับ หรือใช้ปุ่ม ← → (รูปแรกจะแสดงเป็นปกในหน้าสาธารณะ)
        <span v-if="reordering" class="ml-1 text-amber-700">กำลังบันทึกลำดับ...</span>
      </p>
      <div class="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        <div
          v-for="(img, idx) in sortedImages"
          :key="img.id"
          draggable="true"
          class="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-white transition"
          :class="tileClass(idx, 'saved')"
          @dragstart="onReorderDragStart($event, idx, 'saved')"
          @dragover="onReorderDragOver($event, idx, 'saved')"
          @drop="onReorderDrop($event, idx, 'saved')"
          @dragend="resetDragState"
        >
          <img
            :src="imageSrc(img)"
            :alt="`รูปที่ ${idx + 1}`"
            draggable="false"
            class="pointer-events-none h-full w-full object-cover"
          >
          <div class="absolute left-1 top-1 flex gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
            <button
              type="button"
              class="rounded bg-white/90 px-1.5 py-0.5 text-xs text-slate-700 shadow disabled:opacity-40"
              :disabled="!canReorder || idx === 0"
              title="เลื่อนไปซ้าย"
              @click.stop="moveImage(idx, -1)"
            >
              ←
            </button>
            <button
              type="button"
              class="rounded bg-white/90 px-1.5 py-0.5 text-xs text-slate-700 shadow disabled:opacity-40"
              :disabled="!canReorder || idx === sortedImages.length - 1"
              title="เลื่อนไปขวา"
              @click.stop="moveImage(idx, 1)"
            >
              →
            </button>
          </div>
          <button
            type="button"
            class="absolute right-1 top-1 rounded bg-red-600/90 px-2 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100"
            :disabled="!canReorder"
            @click.stop="onRemove(img)"
          >
            ลบ
          </button>
          <span
            class="absolute bottom-1 left-1 rounded px-1.5 text-xs text-white"
            :class="idx === 0 ? 'bg-wp-navy/85' : 'bg-black/50'"
          >
            {{ idx === 0 ? 'ปก' : idx + 1 }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
