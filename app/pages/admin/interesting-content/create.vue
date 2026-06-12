<script setup lang="ts">
import {
  emptyInterestingContentForm,
  type InterestingContentFormData,
} from '~/types/interesting-content'

definePageMeta({ layout: 'admin', title: 'เพิ่มคอนเทนต์' })

const form = ref<InterestingContentFormData>(emptyInterestingContentForm())
const formRef = ref<{
  flushPendingAssets: (id: string) => Promise<{ cover: string | null, hero: string | null }>
} | null>(null)
const itemId = ref<string | null>(null)
const coverUrl = ref<string | null>(null)
const heroUrl = ref<string | null>(null)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function flushAssets(id: string) {
  const uploaded = await formRef.value?.flushPendingAssets(id)
  if (uploaded?.cover) coverUrl.value = uploaded.cover
  if (uploaded?.hero) heroUrl.value = uploaded.hero
}

async function onSubmit() {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    if (itemId.value) {
      const { item } = await $fetch<{
        item: { cover_url: string | null, hero_url: string | null }
      }>(`/api/admin/interesting-content/${itemId.value}`, {
        method: 'PATCH',
        body: form.value,
      })
      coverUrl.value = item.cover_url
      heroUrl.value = item.hero_url
      await flushAssets(itemId.value)
    } else {
      const { item } = await $fetch<{ item: { id: string } }>(
        '/api/admin/interesting-content',
        { method: 'POST', body: form.value },
      )
      itemId.value = item.id
      await flushAssets(item.id)
    }

    if (!coverUrl.value || !heroUrl.value) {
      throw new Error('กรุณาอัปโหลดรูปปกและรูปหลักแนวนอน')
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
    <NuxtLink to="/admin/interesting-content" class="text-sm text-slate-500 hover:text-slate-800">
      ← กลับรายการ
    </NuxtLink>

    <p v-if="successMessage" class="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">
      {{ successMessage }}
    </p>
    <p v-if="errorMessage" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
      {{ errorMessage }}
    </p>

    <InterestingContentForm
      ref="formRef"
      v-model="form"
      :item-id="itemId"
      :cover-url="coverUrl"
      :hero-url="heroUrl"
      :saving="saving"
      @update:cover-url="coverUrl = $event"
      @update:hero-url="heroUrl = $event"
      @validation-error="onValidationError"
      @submit="onSubmit"
    >
      <template v-if="itemId" #actions>
        <NuxtLink
          :to="`/admin/interesting-content/${itemId}/edit`"
          class="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          ไปหน้าแก้ไข
        </NuxtLink>
      </template>
    </InterestingContentForm>
  </div>
</template>
