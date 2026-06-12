<script setup lang="ts">
import {
  emptyCustomerReviewForm,
  type CustomerReviewFormData,
} from '~/types/customer-review'

definePageMeta({ layout: 'admin', title: 'แก้ไขรีวิว' })

const route = useRoute()
const id = computed(() => String(route.params.id))

const form = ref<CustomerReviewFormData>(emptyCustomerReviewForm())
const imageUrl = ref<string | null>(null)
const saving = ref(false)
const loading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    const { item } = await $fetch<{
      item: CustomerReviewFormData & { image_url?: string | null }
    }>(`/api/admin/customer-reviews/${id.value}`)
    form.value = {
      sort_order: item.sort_order,
      status: item.status,
    }
    imageUrl.value = item.image_url ?? null
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
    const { item } = await $fetch<{ item: { image_url: string | null } }>(
      `/api/admin/customer-reviews/${id.value}`,
      { method: 'PATCH', body: form.value },
    )
    imageUrl.value = item.image_url
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
    <NuxtLink to="/admin/customer-reviews" class="text-sm text-slate-500 hover:text-slate-800">
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

      <CustomerReviewForm
        v-model="form"
        :review-id="id"
        :image-url="imageUrl"
        :saving="saving"
        @update:image-url="imageUrl = $event"
        @validation-error="onValidationError"
        @submit="onSubmit"
      />
    </template>
  </div>
</template>
