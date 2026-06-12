<script setup lang="ts">
import { ADMIN_VIDEO_MAX_BYTES } from '~/utils/admin-video'
import { useReelMediaUpload } from '~/composables/useReelMediaUpload'

const props = withDefaults(
  defineProps<{
    reelId: string | null
    posterUrl: string | null
    required?: boolean
    disabled?: boolean
  }>(),
  {
    required: false,
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:posterUrl': [string | null]
  'update:videoUrl': [string | null]
}>()

const reelIdRef = toRef(() => props.reelId)
const {
  uploading,
  uploadError,
  pendingPreviewUrl,
  selectFile,
  removeMedia,
  flushPending,
  videoAccept,
  isAllowedAdminVideoInput,
} = useReelMediaUpload(reelIdRef)

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const localError = ref('')

const displayUrl = computed(() => props.posterUrl || pendingPreviewUrl.value)
const canPick = computed(() => !props.disabled)

function onFiles(fileList: FileList | File[]) {
  if (!canPick.value) return
  const file = Array.from(fileList).find(isAllowedAdminVideoInput)
  if (!file) {
    localError.value = 'ไฟล์ไม่รองรับ — ใช้ MP4 หรือ WebM เท่านั้น'
    return
  }
  localError.value = ''
  selectFile(file).then((url) => {
    if (url) {
      emit('update:posterUrl', url)
      if (props.reelId) {
        $fetch<{ item: { video_url: string | null } }>(`/api/admin/reels/${props.reelId}`)
          .then(({ item }) => emit('update:videoUrl', item.video_url))
      }
    } else if (!props.posterUrl && pendingPreviewUrl.value) {
      emit('update:posterUrl', pendingPreviewUrl.value)
    }
  })
}

async function onRemove() {
  if (!displayUrl.value || !confirm('ลบวิดีโอนี้?')) return
  const ok = await removeMedia()
  if (ok) {
    emit('update:posterUrl', null)
    emit('update:videoUrl', null)
  }
}

defineExpose({
  flushPending,
})
</script>

<template>
  <div class="space-y-2">
    <label class="block text-sm font-medium text-slate-700">
      วิดีโอ Reels
      <span v-if="required" class="text-red-600">*</span>
    </label>
    <p class="text-xs text-slate-500">
      อัปโหลด MP4/WebM — ระบบสร้างภาพปกอัตโนมัติ · สูงสุด {{ Math.round(ADMIN_VIDEO_MAX_BYTES / 1024 / 1024) }}MB
    </p>

    <div
      class="relative mx-auto max-w-xs overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50"
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
        class="aspect-[9/16] w-full object-cover"
      >
      <div
        v-else
        class="flex aspect-[9/16] w-full flex-col items-center justify-center px-4 py-8 text-center text-sm text-slate-500"
      >
        <span>ลากวิดีโอมาวาง หรือคลิกเลือกไฟล์</span>
        <span class="mt-2 text-xs text-slate-400">MP4, WebM · แนวตั้ง 9:16 แนะนำ</span>
      </div>

      <span
        v-if="displayUrl"
        class="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <svg class="h-10 w-10 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>

      <div
        v-if="uploading"
        class="absolute inset-0 flex items-center justify-center bg-white/80 text-sm text-slate-600"
      >
        กำลังอัปโหลด...
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      class="hidden"
      :accept="videoAccept"
      :disabled="!canPick"
      @change="onFiles(($event.target as HTMLInputElement).files ?? [])"
    >

    <div v-if="displayUrl && canPick" class="flex justify-center gap-2">
      <button
        type="button"
        class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
        @click.stop="fileInput?.click()"
      >
        เปลี่ยนวิดีโอ
      </button>
      <button
        type="button"
        class="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
        @click.stop="onRemove"
      >
        ลบวิดีโอ
      </button>
    </div>

    <p v-if="localError || uploadError" class="text-sm text-red-600">
      {{ localError || uploadError }}
    </p>
  </div>
</template>
