<script setup lang="ts">
import { emptySaleForm, type SaleRequestFormData } from '~/types/sale-request'

definePageMeta({ layout: 'admin', title: 'รับคำขอซื้อ' })

const form = ref<SaleRequestFormData>(emptySaleForm())
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function onSubmit() {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { sale } = await $fetch<{ sale: { id: string } }>('/api/admin/sales', {
      method: 'POST',
      body: form.value,
    })
    successMessage.value = 'บันทึกคำขอซื้อสำเร็จ'
    await navigateTo(`/admin/sales/${sale.id}/edit?created=1`)
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    errorMessage.value = err.data?.statusMessage ?? 'บันทึกไม่สำเร็จ'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <NuxtLink to="/admin/sales" class="text-sm text-slate-500 hover:text-slate-800">
      ← กลับรายการสนใจซื้อ
    </NuxtLink>
    <p class="text-sm text-slate-600">
      บันทึกคำขอซื้อแทนลูกค้า (สำหรับทดสอบหรือกรอกให้โดยตรง)
    </p>
    <p v-if="successMessage" class="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">
      {{ successMessage }}
    </p>
    <p v-if="errorMessage" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
      {{ errorMessage }}
    </p>
    <SaleRequestForm v-model="form" :show-status="true" :saving="saving" @submit="onSubmit" />
  </div>
</template>
