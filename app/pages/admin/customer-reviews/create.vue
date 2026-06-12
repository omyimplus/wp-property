<script setup lang="ts">
import {
  emptyCustomerReviewForm,
  type CustomerReviewFormData,
} from '~/types/customer-review'

definePageMeta({ layout: 'admin', title: 'เพิ่มรีวิว' })

const form = ref<CustomerReviewFormData>(emptyCustomerReviewForm())
const formRef = ref<{ flushPendingImage: (id: string) => Promise<string | null> } | null>(null)
const reviewId = ref<string | null>(null)
const imageUrl = ref<string | null>(null)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function flushImage(id: string) {
  const uploaded = await formRef.value?.flushPendingImage(id) ?? null
  if (uploaded) imageUrl.value = uploaded
}

async function onSubmit() {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    if (reviewId.value) {
      const { item } = await $fetch<{ item: { image_url: string | null } }>(
        `/api/admin/customer-reviews/${reviewId.value}`,
        { method: 'PATCH', body: form.value },
      )
      imageUrl.value = item.image_url
      await flushImage(reviewId.value)
    } else {
      const { item } = await $fetch<{ item: { id: string } }>(
        '/api/admin/customer-reviews',
        { method: 'POST', body: form.value },
      )
      reviewId.value = item.id
      await flushImage(item.id)
    }

    if (!imageUrl.value) {
      throw new Error('กรุณาอัปโหลดรูปรีวิว')
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
    <NuxtLink to="/admin/customer-reviews" class="text-sm text-slate-500 hover:text-slate-800">
      ← กลับรายการ
    </NuxtLink>

    <p v-if="successMessage" class="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">
      {{ successMessage }}
    </p>
    <p v-if="errorMessage" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
      {{ errorMessage }}
    </p>

    <CustomerReviewForm
      ref="formRef"
      v-model="form"
      :review-id="reviewId"
      :image-url="imageUrl"
      :saving="saving"
      @update:image-url="imageUrl = $event"
      @validation-error="onValidationError"
      @submit="onSubmit"
    >
      <template v-if="reviewId" #actions>
        <NuxtLink
          :to="`/admin/customer-reviews/${reviewId}/edit`"
          class="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          ไปหน้าแก้ไข
        </NuxtLink>
      </template>
    </CustomerReviewForm>
  </div>
</template>
