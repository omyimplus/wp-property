<script setup lang="ts">
import {
  ARTICLE_STATUSES,
  type ArticleFormData,
} from '~/types/article'

const props = defineProps<{
  modelValue: ArticleFormData
  articleId: string | null
  coverUrl: string | null
  saving?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [ArticleFormData]
  'update:coverUrl': [string | null]
  submit: []
  'validation-error': [string]
}>()

const coverUploadRef = ref<{ flushPending: (id: string) => Promise<string | null> } | null>(null)

defineExpose({
  flushPendingCover: async (id: string) => {
    return await coverUploadRef.value?.flushPending(id) ?? null
  },
})

function setField<K extends keyof ArticleFormData>(
  key: K,
  value: ArticleFormData[K],
) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function onSubmit() {
  if (!props.coverUrl) {
    emit('validation-error', 'กรุณาอัปโหลดรูปหลัก')
    return
  }
  emit('submit')
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="onSubmit">
    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
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
          <label class="mb-1 block text-sm font-medium text-slate-700">Slug (URL)</label>
          <input
            :value="modelValue.slug"
            type="text"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
            placeholder="เว้นว่างเพื่อสร้างจากหัวข้ออัตโนมัติ"
            @input="setField('slug', ($event.target as HTMLInputElement).value)"
          >
          <p class="mt-1 text-xs text-slate-500">ใช้ใน URL เช่น /articles/slug-นี้</p>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">คำอธิบายสั้น</label>
          <textarea
            :value="modelValue.excerpt ?? ''"
            rows="2"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="แสดงในรายการและใต้หัวข้อ"
            @input="setField('excerpt', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">เนื้อหา</label>
          <ClientOnly>
            <RichTextEditor
              :model-value="modelValue.body_html"
              :content-item-id="articleId"
              media-entity="articles"
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
              @change="setField('status', ($event.target as HTMLSelectElement).value as ArticleFormData['status'])"
            >
              <option
                v-for="st in ARTICLE_STATUSES"
                :key="st.value"
                :value="st.value"
              >
                {{ st.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <ArticleCoverUpload
        ref="coverUploadRef"
        :article-id="articleId"
        :image-url="coverUrl"
        required
        @update:image-url="emit('update:coverUrl', $event)"
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
