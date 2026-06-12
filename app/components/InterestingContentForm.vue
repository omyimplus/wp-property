<script setup lang="ts">
import {
  INTERESTING_CONTENT_STATUSES,
  type InterestingContentFormData,
} from '~/types/interesting-content'

const props = defineProps<{
  modelValue: InterestingContentFormData
  itemId: string | null
  coverUrl: string | null
  heroUrl: string | null
  saving?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [InterestingContentFormData]
  'update:coverUrl': [string | null]
  'update:heroUrl': [string | null]
  submit: []
  'validation-error': [string]
}>()

const coverUploadRef = ref<{ flushPending: (id: string) => Promise<string | null> } | null>(null)
const heroUploadRef = ref<{ flushPending: (id: string) => Promise<string | null> } | null>(null)

defineExpose({
  flushPendingAssets: async (id: string) => {
    const cover = await coverUploadRef.value?.flushPending(id) ?? null
    const hero = await heroUploadRef.value?.flushPending(id) ?? null
    return { cover, hero }
  },
})

function setField<K extends keyof InterestingContentFormData>(
  key: K,
  value: InterestingContentFormData[K],
) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function onSubmit() {
  if (!props.coverUrl) {
    emit('validation-error', 'กรุณาอัปโหลดรูปปก')
    return
  }
  if (!props.heroUrl) {
    emit('validation-error', 'กรุณาอัปโหลดรูปหลักแนวนอน')
    return
  }
  emit('submit')
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="onSubmit">
    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div class="space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">หัวข้อ *</label>
          <input
            :value="modelValue.title"
            type="text"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            @input="setField('title', ($event.target as HTMLInputElement).value)"
          >
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">คำอธิบายสั้น</label>
          <textarea
            :value="modelValue.excerpt ?? ''"
            rows="2"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="แสดงใต้หัวข้อในหน้ารายละเอียด"
            @input="setField('excerpt', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">เนื้อหา</label>
          <ClientOnly>
            <RichTextEditor
              :model-value="modelValue.body_html"
              :content-item-id="itemId"
              @update:model-value="setField('body_html', $event)"
            />
            <template #fallback>
              <div class="min-h-[200px] rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm text-slate-400">
                กำลังโหลด editor...
              </div>
            </template>
          </ClientOnly>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">ลิงก์ภายนอก (ถ้ามี)</label>
            <input
              :value="modelValue.link_url ?? ''"
              type="url"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="https://"
              @input="setField('link_url', ($event.target as HTMLInputElement).value)"
            >
          </div>
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
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">สถานะ</label>
          <select
            :value="modelValue.status"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:max-w-xs"
            @change="setField('status', ($event.target as HTMLSelectElement).value as InterestingContentFormData['status'])"
          >
            <option
              v-for="st in INTERESTING_CONTENT_STATUSES"
              :key="st.value"
              :value="st.value"
            >
              {{ st.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="space-y-5">
        <InterestingContentAssetUpload
          ref="coverUploadRef"
          kind="cover"
          label="รูปปก"
          hint="แนวตั้ง — แสดงบนหน้าแรกและรายการ"
          aspect-class="aspect-[3/4] max-h-72"
          :item-id="itemId"
          :image-url="coverUrl"
          required
          @update:image-url="emit('update:coverUrl', $event)"
        />
        <InterestingContentAssetUpload
          ref="heroUploadRef"
          kind="hero"
          label="รูปหลักแนวนอน"
          hint="แนวนอน — แสดงด้านบนหน้ารายละเอียด"
          aspect-class="aspect-[16/10]"
          :item-id="itemId"
          :image-url="heroUrl"
          required
          @update:image-url="emit('update:heroUrl', $event)"
        />
      </div>
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
