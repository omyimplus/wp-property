<script setup lang="ts">
import {
  CUSTOMER_REVIEW_STATUSES,
  type CustomerReviewFormData,
} from '~/types/customer-review'

const props = defineProps<{
  modelValue: CustomerReviewFormData
  reviewId: string | null
  imageUrl: string | null
  saving?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [CustomerReviewFormData]
  'update:imageUrl': [string | null]
  submit: []
  'validation-error': [string]
}>()

const uploadRef = ref<{ flushPending: (id: string) => Promise<string | null> } | null>(null)

defineExpose({
  flushPendingImage: async (id: string) => {
    return await uploadRef.value?.flushPending(id) ?? null
  },
})

function setField<K extends keyof CustomerReviewFormData>(
  key: K,
  value: CustomerReviewFormData[K],
) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function onSubmit() {
  if (!props.imageUrl) {
    emit('validation-error', 'กรุณาอัปโหลดรูปรีวิว')
    return
  }
  emit('submit')
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="onSubmit">
    <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
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
            @change="setField('status', ($event.target as HTMLSelectElement).value as CustomerReviewFormData['status'])"
          >
            <option
              v-for="st in CUSTOMER_REVIEW_STATUSES"
              :key="st.value"
              :value="st.value"
            >
              {{ st.label }}
            </option>
          </select>
        </div>
      </div>

      <CustomerReviewImageUpload
        ref="uploadRef"
        :review-id="reviewId"
        :image-url="imageUrl"
        required
        @update:image-url="emit('update:imageUrl', $event)"
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
