<script setup lang="ts">
import {
  emptyArticleForm,
  type ArticleFormData,
} from '~/types/article'

definePageMeta({ layout: 'admin', title: 'แก้ไขบทความ' })

const route = useRoute()
const id = computed(() => String(route.params.id))

const form = ref<ArticleFormData>(emptyArticleForm())
const coverUrl = ref<string | null>(null)
const saving = ref(false)
const loading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    const { item } = await $fetch<{
      item: ArticleFormData & { cover_url?: string | null }
    }>(`/api/admin/articles/${id.value}`)
    form.value = {
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt ?? '',
      body_html: item.body_html,
      sort_order: item.sort_order,
      status: item.status,
    }
    coverUrl.value = item.cover_url ?? null
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'โหลดไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { item } = await $fetch<{ item: { cover_url: string | null } }>(
      `/api/admin/articles/${id.value}`,
      { method: 'PATCH', body: form.value },
    )
    coverUrl.value = item.cover_url
    successMessage.value = 'บันทึกแล้ว'
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'บันทึกไม่สำเร็จ'
  } finally {
    saving.value = false
  }
}

function onValidationError(message: string) {
  errorMessage.value = message
}

onMounted(load)
</script>

<template>
  <div class="space-y-4">
    <NuxtLink to="/admin/articles" class="text-sm text-slate-500 hover:text-slate-800">
      ← กลับรายการ
    </NuxtLink>

    <div v-if="loading" class="py-12 text-center text-slate-500">กำลังโหลด...</div>

    <template v-else>
      <p v-if="successMessage" class="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">
        {{ successMessage }}
      </p>
      <p v-if="errorMessage" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
        {{ errorMessage }}
      </p>

      <ArticleForm
        v-model="form"
        :article-id="id"
        :cover-url="coverUrl"
        :saving="saving"
        @update:cover-url="coverUrl = $event"
        @validation-error="onValidationError"
        @submit="onSubmit"
      />
    </template>
  </div>
</template>
