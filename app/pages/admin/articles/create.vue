<script setup lang="ts">
import {
  emptyArticleForm,
  type ArticleFormData,
} from '~/types/article'

definePageMeta({ layout: 'admin', title: 'เพิ่มบทความ' })

const form = ref<ArticleFormData>(emptyArticleForm())
const formRef = ref<{ flushPendingCover: (id: string) => Promise<string | null> } | null>(null)
const articleId = ref<string | null>(null)
const coverUrl = ref<string | null>(null)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function flushCover(id: string) {
  const uploaded = await formRef.value?.flushPendingCover(id) ?? null
  if (uploaded) coverUrl.value = uploaded
}

async function onSubmit() {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    if (articleId.value) {
      const { item } = await $fetch<{ item: { cover_url: string | null } }>(
        `/api/admin/articles/${articleId.value}`,
        { method: 'PATCH', body: form.value },
      )
      coverUrl.value = item.cover_url
      await flushCover(articleId.value)
    } else {
      const { item } = await $fetch<{ item: { id: string } }>(
        '/api/admin/articles',
        { method: 'POST', body: form.value },
      )
      articleId.value = item.id
      await flushCover(item.id)
    }

    if (!coverUrl.value) {
      throw new Error('กรุณาอัปโหลดรูปหลัก')
    }

    successMessage.value = 'บันทึกแล้ว'
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }, message?: string }
    errorMessage.value = err.data?.statusMessage ?? err.message ?? 'บันทึกไม่สำเร็จ'
  } finally {
    saving.value = false
  }
}

function onValidationError(message: string) {
  errorMessage.value = message
}
</script>

<template>
  <div class="space-y-4">
    <NuxtLink to="/admin/articles" class="text-sm text-slate-500 hover:text-slate-800">
      ← กลับรายการ
    </NuxtLink>

    <p v-if="successMessage" class="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">
      {{ successMessage }}
    </p>
    <p v-if="errorMessage" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
      {{ errorMessage }}
    </p>

    <ArticleForm
      ref="formRef"
      v-model="form"
      :article-id="articleId"
      :cover-url="coverUrl"
      :saving="saving"
      @update:cover-url="coverUrl = $event"
      @validation-error="onValidationError"
      @submit="onSubmit"
    >
      <template v-if="articleId" #actions>
        <NuxtLink
          :to="`/admin/articles/${articleId}/edit`"
          class="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          ไปหน้าแก้ไข
        </NuxtLink>
      </template>
    </ArticleForm>
  </div>
</template>
