<script setup lang="ts">
import {
  ADMIN_IMAGE_INPUT_TYPES,
  ADMIN_IMAGE_MAX_WIDTH,
  isAllowedAdminImageInput,
} from '~/utils/admin-image'
import {
  type InterestingContentAssetKind,
  useInterestingContentAssetUpload,
} from '~/composables/useInterestingContentAssetUpload'

const props = withDefaults(
  defineProps<{
    kind: InterestingContentAssetKind
    label: string
    hint?: string
    aspectClass?: string
    itemId: string | null
    imageUrl: string | null
    required?: boolean
    disabled?: boolean
  }>(),
  {
    hint: '',
    aspectClass: 'aspect-[3/4] max-h-80',
    required: false,
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:imageUrl': [string | null]
}>()

const itemIdRef = toRef(() => props.itemId)
const { uploading, uploadError, pendingPreviewUrl, selectFile, removeAsset, flushPending } =
  useInterestingContentAssetUpload(itemIdRef, props.kind)

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const localError = ref('')
const acceptAttr = ADMIN_IMAGE_INPUT_TYPES.join(',')

const displayUrl = computed(() => props.imageUrl || pendingPreviewUrl.value)
const canPick = computed(() => !props.disabled)

function onFiles(fileList: FileList | File[]) {
  if (!canPick.value) return
  const file = Array.from(fileList).find(isAllowedAdminImageInput)
  if (!file) {
    localError.value = 'ไฟล์ไม่รองรับ — ใช้ JPG, PNG, WebP หรือ GIF'
    return
  }
  localError.value = ''
  selectFile(file).then((url) => {
    if (url) emit('update:imageUrl', url)
    else if (!props.imageUrl && pendingPreviewUrl.value) {
      emit('update:imageUrl', pendingPreviewUrl.value)
    }
  })
}

async function onRemove() {
  if (!displayUrl.value || !confirm(`ลบ${props.label}?`)) return
  const ok = await removeAsset()
  if (ok) emit('update:imageUrl', null)
}

defineExpose({
  flushPending,
})
</script>

<template>
  <div class="space-y-2">
    <label class="block text-sm font-medium text-slate-700">
      {{ label }}
      <span v-if="required" class="text-red-600">*</span>
    </label>
    <p v-if="hint" class="text-xs text-slate-500">{{ hint }}</p>

    <div
      class="relative overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50"
      :class="[
        canPick ? 'cursor-pointer hover:border-sky-400 hover:bg-sky-50/50' : 'opacity-70',
        isDragging && 'border-sky-500 bg-sky-50',
        required && !displayUrl && 'border-amber-300',
      ]"
      @dragover.prevent="isDragging = canPick"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="isDragging = false; onFiles($event.dataTransfer?.files ?? [])"
      @click="canPick && fileInput?.click()"
    >
      <img
        v-if="displayUrl"
        :src="displayUrl"
        alt=""
        class="w-full object-cover"
        :class="aspectClass"
      >
      <div
        v-else
        class="flex w-full flex-col items-center justify-center px-4 py-8 text-center text-sm text-slate-500"
        :class="aspectClass"
      >
        <span>ลากรูปมาวาง หรือคลิกเลือกไฟล์</span>
        <span class="mt-2 text-xs text-slate-400">
          JPG, PNG, WebP, GIF · กว้างไม่เกิน {{ ADMIN_IMAGE_MAX_WIDTH }}px → WebP
        </span>
      </div>
      <div
        v-if="uploading"
        class="absolute inset-0 flex items-center justify-center bg-white/80 text-sm text-slate-600"
      >
        กำลังปรับขนาดและอัปโหลด...
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      class="hidden"
      :accept="acceptAttr"
      :disabled="!canPick"
      @change="onFiles(($event.target as HTMLInputElement).files ?? [])"
    >

    <div v-if="displayUrl && canPick" class="flex gap-2">
      <button
        type="button"
        class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
        @click.stop="fileInput?.click()"
      >
        เปลี่ยนรูป
      </button>
      <button
        type="button"
        class="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
        @click.stop="onRemove"
      >
        ลบรูป
      </button>
    </div>

    <p v-if="localError || uploadError" class="text-sm text-red-600">
      {{ localError || uploadError }}
    </p>
  </div>
</template>
