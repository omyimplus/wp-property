<script setup lang="ts">
import {
  REEL_STATUSES,
  type ReelFormData,
} from '~/types/reel'

const props = defineProps<{
  modelValue: ReelFormData
  reelId: string | null
  posterUrl: string | null
  videoUrl: string | null
  saving?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [ReelFormData]
  'update:posterUrl': [string | null]
  'update:videoUrl': [string | null]
  submit: []
  'validation-error': [string]
}>()

const uploadRef = ref<{
  flushPending: (id: string) => Promise<{ posterUrl: string | null, videoUrl: string | null }>
} | null>(null)

defineExpose({
  flushPendingMedia: async (id: string) => {
    return await uploadRef.value?.flushPending(id) ?? { posterUrl: null, videoUrl: null }
  },
})

function setField<K extends keyof ReelFormData>(
  key: K,
  value: ReelFormData[K],
) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function onSubmit() {
  if (!props.posterUrl) {
    emit('validation-error', 'กรุณาอัปโหลดวิดีโอ')
    return
  }
  emit('submit')
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="onSubmit">
    <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div class="space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">ลิงก์ภายนอก (ถ้ามี)</label>
          <input
            :value="modelValue.link_url ?? ''"
            type="url"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="https://tiktok.com/... หรือ Instagram Reels"
            @input="setField('link_url', ($event.target as HTMLInputElement).value)"
          >
          <p class="mt-1 text-xs text-slate-500">
            คลิกที่คลิปบนหน้าเว็บจะเปิดลิงก์นี้ — ถ้าไม่ใส่จะเปิดไฟล์วิดีโอ
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">ลำดับแสดงผล</label>
            <input
              :value="modelValue.sort_order"
              type="number"
              min="0"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              @input="setField('sort_order', Number(($event.target as HTMLInputElement).value) || 0)"
            >
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">สถานะ</label>
            <select
              :value="modelValue.status"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              @change="setField('status', ($event.target as HTMLSelectElement).value as ReelFormData['status'])"
            >
              <option
                v-for="st in REEL_STATUSES"
                :key="st.value"
                :value="st.value"
              >
                {{ st.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <ReelVideoUpload
        ref="uploadRef"
        :reel-id="reelId"
        :poster-url="posterUrl"
        required
        @update:poster-url="emit('update:posterUrl', $event)"
        @update:video-url="emit('update:videoUrl', $event)"
      />
    </div>

    <div class="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
      <button
        type="submit"
        class="rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-800 disabled:opacity-50"
        :disabled="saving"
      >
        {{ saving ? 'กำลังบันทึก...' : 'บันทึก' }}
      </button>
      <slot name="actions" />
    </div>
  </form>
</template>
